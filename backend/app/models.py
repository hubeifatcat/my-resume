from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=8, max_length=64)
    email: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str = ""
    role: str = "user"


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    visitor_name: str | None = None
    skills: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    mode: str
    agents: list[str] = Field(default_factory=list)
    trace: dict = Field(default_factory=dict)
    blackboard: dict = Field(default_factory=dict)
    quota_remaining: int = 0
    quota_limit: int = 0
    quota_used: int = 0


class ConversationSummary(BaseModel):
    conversation_id: str
    title: str
    message_count: int
    updated_at: float


class ConversationDetail(BaseModel):
    conversation_id: str
    title: str
    messages: list
    trace: dict
