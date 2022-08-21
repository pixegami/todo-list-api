import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import Task from "../components/task";
import TaskItem from "../components/taskItem";

const Home: NextPage = () => {
  const todoApiEndpoint: string =
    "https://uvd7xa7y2f3vqyl3sviqbvwkoi0emyut.lambda-url.us-east-1.on.aws";

  const userId: string = "test-site-user";
  const [isLoading, setIsLoading] = React.useState(true);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [newTaskContent, setNewTaskContent] = React.useState("");

  const getTasks = async () => {
    setIsLoading(true);
    const response = await fetch(`${todoApiEndpoint}/list-tasks/${userId}`);
    const responseData = await response.json();

    // Convert raw JSON to tasks.
    const tasks: Task[] = responseData.tasks;
    console.log(tasks);
    setTasks(tasks);
    setIsLoading(false);
  };

  // Get the existing to-do items.
  useEffect(() => {
    getTasks();
  }, []);

  const putTask = async (task: Task) => {
    const response = await fetch(`${todoApiEndpoint}/create-task`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    console.log(response);
    const responseData = await response.json();
    const taskId: string = responseData.task.task_id;
    console.log(`Successfully put task: ${taskId}`);
    getTasks();
  };

  const deleteTask = async (taskId?: string) => {
    // Remove it from the local task list.
    const newTasks = tasks.filter((task) => task.task_id !== taskId);
    setTasks(newTasks);

    // Delete task from table.
    const response = await fetch(`${todoApiEndpoint}/delete-task/${taskId}`, {
      method: "DELETE",
    });
    console.log(response);
  };

  const updateTask = async (updatedTask: Task) => {
    const response = await fetch(`${todoApiEndpoint}/update-task`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
    console.log(response);
  };

  const addNewTask = async () => {
    const task: Task = {
      user_id: userId,
      content: newTaskContent,
      is_done: false,
    };
    setNewTaskContent("");
    await putTask(task);
  };

  // Create the task input field.
  const taskInputField = (
    <div>
      <input
        type="text"
        placeholder="Enter task here"
        value={newTaskContent}
        onChange={(e) => setNewTaskContent(e.target.value)}
      />
      <button onClick={addNewTask}>Add</button>
    </div>
  );

  // Create a list of the tasks.
  const taskList = (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.task_id}
          {...task}
          onDelete={deleteTask}
          onUpdate={updateTask}
        />
      ))}
    </div>
  );

  return (
    <div>
      <Head>
        <title>To-Do List App</title>
        <meta name="description" content="To-do list app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>Hello World</div>
        {taskList}
        {taskInputField}
      </main>
    </div>
  );
};

export default Home;
