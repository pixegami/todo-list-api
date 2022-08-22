import React from "react";
import Task from "./task";

interface TaskItemInterface extends Task {
  onDelete: (taskId?: string) => void;
  onUpdate: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemInterface> = (props) => {
  const [isDone, setIsDone] = React.useState(props.is_done);

  const handleTaskUpdate = async () => {
    const newIsDoneValue = !isDone;
    setIsDone(!isDone);
    const updatedTask = {
      task_id: props.task_id,
      user_id: props.user_id,
      content: props.content,
      is_done: newIsDoneValue,
    };
    props.onUpdate(updatedTask);
  };

  const taskStyle: string = isDone ? "text-gray-400 line-through" : "";

  // Create a task item with a check box.
  const taskItem = (
    <div className="border border-gray-300 rounded-md p-3 mb-2 flex">
      <input type="checkbox" checked={isDone} onChange={handleTaskUpdate} />
      <div className={"ml-4 " + taskStyle}>{props.content}</div>
      <div className="grow" />
      <button
        className="text-red-500 ml-4"
        onClick={() => {
          props.onDelete(props.task_id);
        }}
      >
        delete
      </button>
    </div>
  );
  return taskItem;
};
export default TaskItem;
