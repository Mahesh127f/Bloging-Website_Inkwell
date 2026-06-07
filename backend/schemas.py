from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = ""

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    bio: str
    avatar_url: str
    created_at: datetime
    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    id: int
    username: str
    full_name: str
    bio: str
    avatar_url: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TagOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = ""
    cover_image: Optional[str] = ""
    tags: Optional[List[str]] = []
    featured: Optional[bool] = False

class AuthorOut(BaseModel):
    id: int
    username: str
    full_name: str
    avatar_url: str
    class Config:
        from_attributes = True

class PostOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: str
    cover_image: str
    author_id: int
    views: int
    featured: bool
    created_at: datetime
    updated_at: Optional[datetime]
    author: AuthorOut
    tags: List[TagOut]
    like_count: Optional[int] = 0
    comment_count: Optional[int] = 0
    class Config:
        from_attributes = True

class PaginatedPosts(BaseModel):
    posts: List[PostOut]
    total: int
    page: int
    pages: int

class CommentCreate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    content: str
    post_id: int
    author_id: int
    created_at: datetime
    author: AuthorOut
    class Config:
        from_attributes = True
