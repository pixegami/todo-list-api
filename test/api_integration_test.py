from uuid import uuid4
import requests


ENDPOINT = "http://localhost:8000"


def test_can_put_and_get_task():
    create_response = create_task("user1", "task1")
    assert create_response.status_code == 200

    task_id = create_response.json()["task"]["task_id"]
    get_task_response = get_task(task_id)
    assert create_response.status_code == 200
    assert get_task_response.json()["task"]["content"] == "task1"


def test_can_list_tasks():
    # Create a new user for this test.
    user_id = f"user_{uuid4().hex}"

    # Create 3 tasks for this user.
    for i in range(3):
        create_task(user_id, f"task_{i}")

    # List the tasks for this user.
    response = list_tasks("user1")
    tasks = response.json()["tasks"]
    assert len(tasks) == 3


def test_can_delete_task():
    create_response = create_task("user1", "task1")
    task_id = create_response.json()["task"]["task_id"]

    delete_task(task_id)

    # We shouldn't be able to get the task anymore.
    get_task_response = get_task(task_id)
    assert get_task_response.status_code == 404


def test_can_update_task():
    # Create a new user for this test.
    user_id = f"user_{uuid4().hex}"
    create_response = create_task(user_id, "task1")
    task_id = create_response.json()["task"]["task_id"]

    # Update the task with new content.
    new_task_content = f"updated task content: {uuid4().hex}"
    payload = {
        "content": new_task_content,
        "task_id": task_id,
    }
    update_response = update_task(payload)
    updated_task_content = update_response.json()["task"]["content"]
    assert updated_task_content == new_task_content


def list_tasks(user_id: str) -> dict:
    return requests.get(f"{ENDPOINT}/list-tasks/{user_id}")


def create_task(user_id: str, content: str) -> dict:
    payload = {
        "user_id": user_id,
        "content": content,
    }
    return requests.put(f"{ENDPOINT}/create-task", json=payload)


def get_task(task_id: str) -> dict:
    return requests.get(f"{ENDPOINT}/get-task/{task_id}")


def delete_task(task_id: str) -> dict:
    return requests.delete(f"{ENDPOINT}/delete-task/{task_id}")


def update_task(task_id: str) -> dict:
    payload = {"task_id": task_id}
    return requests.put(f"{ENDPOINT}/update-task", json=payload)
