from typing import Optional
from uuid import uuid4
from fastapi import FastAPI
from mangum import Mangum
from pydantic import BaseModel

app = FastAPI()
handler = Mangum(app)


class PutTaskRequest(BaseModel):
    user_id: str
    content: str
    task_id: Optional[str] = None
    is_done: bool = False


@app.get("/")
async def root():
    return {"message": "Hello from ToDo API!"}


@app.get("/list-tasks/{user_id}")
async def list_tasks(user_id: str):
    return {"user_id": user_id}


@app.get("/get-task/{task_id}")
async def get_task(task_id: str):
    return {"task_id": task_id}


@app.put("/create-task")
async def create_task(put_task_request: PutTaskRequest):
    task = {
        "user_id": put_task_request.user_id,
        "content": put_task_request.content,
        "is_done": False,
        "task_id": uuid4().hex,
    }
    return {"task": task}


@app.put("/update-task")
async def update_task(put_task_request: PutTaskRequest):
    return {"task": put_task_request}


@app.delete("/delete-task/{task_id}")
async def delete_task(task_id: str):
    return {"task_id": task_id}
