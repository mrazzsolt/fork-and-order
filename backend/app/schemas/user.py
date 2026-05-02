from pydantic import BaseModel, EmailStr, field_validator

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator('password')
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be 72 bytes or shorter')
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"