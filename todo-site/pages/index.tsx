import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import Task from "../components/task";
import TaskItem from "../components/taskItem";
import { v4 as uuidv4 } from "uuid";

const Home: NextPage = () => {
  // TODO: Update this URL to your own API endpoint!
  const todoApiEndpoint: string =
    "https://cv736exbi2rvfpwo45jluf3u5a0olvpe.lambda-url.ap-southeast-2.on.aws";

  const userId: string = "pixegami";
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
    // Put a local copy of this task into the state first for immediate feedback.
    setTasks([task, ...tasks]);

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
      task_id: `task_${uuidv4()}`, // New task with UUID4
      user_id: userId,
      content: newTaskContent,
      is_done: false,
    };
    setNewTaskContent("");
    await putTask(task);
  };

  // Create the task input field.
  const taskInputField = (
    <div className="flex mt-6">
      <input
        className="border border-gray-300 p-2 rounded-md grow mr-4"
        type="text"
        placeholder="Enter task here"
        value={newTaskContent}
        onChange={(e) => setNewTaskContent(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white w-24 p-2 rounded-md"
        onClick={addNewTask}
      >
        Add
      </button>
    </div>
  );

  // Create a list of the tasks.
  const taskList = (
    // Create task using index as key
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

  const loadingText: string = isLoading ? "Loading" : "Ready";
  const loadingTextColor: string = isLoading
    ? "text-orange-500"
    : "text-green-500";
  const loadingStatus = (
    <div className={loadingTextColor + " text-center mb-4 text-sm"}>
      {loadingText}
    </div>
  );

  const userIdElement = (
    <div className="text-center text-gray-700">User ID: {userId}</div>
  );

  return (
    <div>
      <Head>
        <title>To-Do List App</title>
        <meta name="description" content="To-do list app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-2xl font-bold text-center">My Tasks</h1>
        {userIdElement}
        {loadingStatus}
        {taskList}
        {taskInputField}
      </main>
    </div>
  );
};

export default Home;
