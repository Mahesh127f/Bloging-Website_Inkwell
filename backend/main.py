from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
import models, schemas, crud, auth
from database import engine, get_db
import seed
import asyncio
import httpx
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inkwell API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = crud.get_user(db, user_id=int(user_id))
    if user is None:
        raise credentials_exception
    return user

def get_optional_user(token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        return get_current_user(token, db)
    except:
        return None

# ── Keep-alive: ping self every 5 minutes so Render free tier never sleeps ──
async def keep_alive():
    await asyncio.sleep(30)  # wait for server to fully start
    render_url = os.environ.get("RENDER_EXTERNAL_URL", "")
    if not render_url:
        return  # only runs on Render, not locally
    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(f"{render_url}/health")
                print(f"[keep-alive] pinged at {datetime.utcnow().isoformat()}")
        except Exception as e:
            print(f"[keep-alive] ping failed: {e}")
        await asyncio.sleep(300)  # every 5 minutes

@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    seed.seed_data(db)
    asyncio.create_task(keep_alive())

# Health check endpoint (used by keep-alive ping)
@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# Auth
@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username taken")
    return crud.create_user(db, user)

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# Users
@app.get("/users/{user_id}", response_model=schemas.UserProfile)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/me", response_model=schemas.UserOut)
def update_profile(update: schemas.UserUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.update_user(db, current_user.id, update)

@app.get("/users/me/profile", response_model=schemas.UserOut)
def get_my_profile(current_user=Depends(get_current_user)):
    return current_user

# Posts
@app.get("/posts", response_model=schemas.PaginatedPosts)
def list_posts(skip: int = 0, limit: int = 10, tag: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_posts(db, skip=skip, limit=limit, tag=tag, search=search)

@app.get("/posts/featured", response_model=List[schemas.PostOut])
def featured_posts(db: Session = Depends(get_db)):
    return crud.get_featured_posts(db)

@app.get("/posts/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: int, db: Session = Depends(get_db), current_user=Depends(get_optional_user)):
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    crud.increment_views(db, post_id)
    return post

@app.post("/posts", response_model=schemas.PostOut)
def create_post(post: schemas.PostCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_post(db, post, current_user.id)

@app.put("/posts/{post_id}", response_model=schemas.PostOut)
def update_post(post_id: int, post: schemas.PostCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    existing = crud.get_post(db, post_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    return crud.update_post(db, post_id, post)

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    existing = crud.get_post(db, post_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    crud.delete_post(db, post_id)
    return {"message": "Deleted"}

# Likes
@app.post("/posts/{post_id}/like")
def toggle_like(post_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    liked = crud.toggle_like(db, post_id, current_user.id)
    count = crud.get_like_count(db, post_id)
    return {"liked": liked, "count": count}

@app.get("/posts/{post_id}/like")
def get_like_status(post_id: int, current_user=Depends(get_optional_user), db: Session = Depends(get_db)):
    liked = crud.is_liked(db, post_id, current_user.id) if current_user else False
    count = crud.get_like_count(db, post_id)
    return {"liked": liked, "count": count}

# Comments
@app.get("/posts/{post_id}/comments", response_model=List[schemas.CommentOut])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return crud.get_comments(db, post_id)

@app.post("/posts/{post_id}/comments", response_model=schemas.CommentOut)
def add_comment(post_id: int, comment: schemas.CommentCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_comment(db, post_id, comment, current_user.id)

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your comment")
    crud.delete_comment(db, comment_id)
    return {"message": "Deleted"}

# Tags
@app.get("/tags", response_model=List[str])
def get_tags(db: Session = Depends(get_db)):
    return crud.get_all_tags(db)
