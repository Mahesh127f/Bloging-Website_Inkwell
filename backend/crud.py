from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import models, schemas, auth
import re

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

def get_unique_slug(db: Session, title: str, post_id: int = None):
    base = slugify(title)
    slug = base
    counter = 1
    while True:
        q = db.query(models.Post).filter(models.Post.slug == slug)
        if post_id:
            q = q.filter(models.Post.id != post_id)
        if not q.first():
            return slug
        slug = f"{base}-{counter}"
        counter += 1

def get_or_create_tag(db: Session, name: str):
    tag = db.query(models.Tag).filter(models.Tag.name == name.lower().strip()).first()
    if not tag:
        tag = models.Tag(name=name.lower().strip())
        db.add(tag)
        db.flush()
    return tag

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = auth.hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed,
        full_name=user.full_name or ""
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, update: schemas.UserUpdate):
    user = get_user(db, user_id)
    if update.full_name is not None:
        user.full_name = update.full_name
    if update.bio is not None:
        user.bio = update.bio
    if update.avatar_url is not None:
        user.avatar_url = update.avatar_url
    db.commit()
    db.refresh(user)
    return user

def enrich_post(db: Session, post):
    post.like_count = db.query(models.Like).filter(models.Like.post_id == post.id).count()
    post.comment_count = db.query(models.Comment).filter(models.Comment.post_id == post.id).count()
    return post

def get_posts(db: Session, skip: int = 0, limit: int = 10, tag: str = None, search: str = None):
    q = db.query(models.Post)
    if tag:
        q = q.join(models.Post.tags).filter(models.Tag.name == tag.lower())
    if search:
        q = q.filter(or_(
            models.Post.title.ilike(f"%{search}%"),
            models.Post.excerpt.ilike(f"%{search}%"),
            models.Post.content.ilike(f"%{search}%")
        ))
    total = q.count()
    posts = q.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    for p in posts:
        enrich_post(db, p)
    pages = (total + limit - 1) // limit if limit > 0 else 1
    return {"posts": posts, "total": total, "page": skip // limit + 1, "pages": pages}

def get_featured_posts(db: Session):
    posts = db.query(models.Post).filter(models.Post.featured == True).order_by(models.Post.created_at.desc()).limit(3).all()
    for p in posts:
        enrich_post(db, p)
    return posts

def get_post(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post:
        enrich_post(db, post)
    return post

def create_post(db: Session, post: schemas.PostCreate, author_id: int):
    slug = get_unique_slug(db, post.title)
    excerpt = post.excerpt or (post.content[:200].strip() + "..." if len(post.content) > 200 else post.content)
    db_post = models.Post(
        title=post.title, slug=slug, content=post.content,
        excerpt=excerpt, cover_image=post.cover_image or "",
        author_id=author_id, featured=post.featured or False
    )
    for tag_name in (post.tags or []):
        tag = get_or_create_tag(db, tag_name)
        db_post.tags.append(tag)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    enrich_post(db, db_post)
    return db_post

def update_post(db: Session, post_id: int, post: schemas.PostCreate):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    db_post.title = post.title
    db_post.slug = get_unique_slug(db, post.title, post_id)
    db_post.content = post.content
    db_post.excerpt = post.excerpt or (post.content[:200].strip() + "...")
    db_post.cover_image = post.cover_image or ""
    db_post.featured = post.featured or False
    db_post.tags = []
    for tag_name in (post.tags or []):
        tag = get_or_create_tag(db, tag_name)
        db_post.tags.append(tag)
    db.commit()
    db.refresh(db_post)
    enrich_post(db, db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    db.delete(post)
    db.commit()

def increment_views(db: Session, post_id: int):
    db.query(models.Post).filter(models.Post.id == post_id).update({"views": models.Post.views + 1})
    db.commit()

def toggle_like(db: Session, post_id: int, user_id: int):
    like = db.query(models.Like).filter(models.Like.post_id == post_id, models.Like.user_id == user_id).first()
    if like:
        db.delete(like)
        db.commit()
        return False
    else:
        db.add(models.Like(post_id=post_id, user_id=user_id))
        db.commit()
        return True

def get_like_count(db: Session, post_id: int):
    return db.query(models.Like).filter(models.Like.post_id == post_id).count()

def is_liked(db: Session, post_id: int, user_id: int):
    return db.query(models.Like).filter(models.Like.post_id == post_id, models.Like.user_id == user_id).first() is not None

def get_comments(db: Session, post_id: int):
    return db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()

def create_comment(db: Session, post_id: int, comment: schemas.CommentCreate, author_id: int):
    db_comment = models.Comment(content=comment.content, post_id=post_id, author_id=author_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comment(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()

def delete_comment(db: Session, comment_id: int):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    db.delete(comment)
    db.commit()

def get_all_tags(db: Session):
    tags = db.query(models.Tag).all()
    return [t.name for t in tags]
