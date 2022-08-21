import os
import time
import boto3
from typing import Optional
from uuid import uuid4
from fastapi import FastAPI, HTTPException
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
    # Get the task from the table.
    table = _get_table()
    response = table.get_item(Key={"task_id": task_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return item


@app.put("/create-task")
async def create_task(put_task_request: PutTaskRequest):
    updated_time = int(time.time())
    item = {
        "user_id": put_task_request.user_id,
        "content": put_task_request.content,
        "is_done": False,
        "updated_time": updated_time,
        "task_id": f"task_{uuid4().hex}",
        "ttl": int(updated_time + 86400),  # Expire after 24 hours.
    }

    # Put it into the table.
    table = _get_table()
    table.put_item(Item=item)
    return {"task": item}


@app.put("/update-task")
async def update_task(put_task_request: PutTaskRequest):
    return {"task": put_task_request}


@app.delete("/delete-task/{task_id}")
async def delete_task(task_id: str):
    return {"task_id": task_id}


def _get_table():
    table_name = os.environ.get("TABLE_NAME")
    return boto3.resource("dynamodb").Table(table_name)
