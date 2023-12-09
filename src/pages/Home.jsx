import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import './home.scss';

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };
  const handleKeyDown = (e, keyDownId) => {
    if (e.key === ' ' || e.key === 'Enter') {
      handleSelectList(keyDownId);
    }
  };
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div>
            <div className="list-header">
              <h2>リスト一覧</h2>
            </div>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>選択中のリストを編集</Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={key}
                  role="tab"
                  tabIndex={0}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  aria-selected={isActive}
                  onClick={() => handleSelectList(list.id)}
                  onKeyDown={(e) => handleKeyDown(e, list.id)}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
            </div>
            <div className="display-select-wrapper">
              <p>
                <Link to="/task/new">タスク新規作成</Link>
              </p>
              <p>
                <select onChange={handleIsDoneDisplayChange} className="display-select">
                  <option value="todo">未完了</option>
                  <option value="done">完了</option>
                </select>
              </p>
            </div>
            <Tasks tasks={tasks} selectListId={selectListId} isDoneDisplay={isDoneDisplay} />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;

  const getFormatedTime = (limitStr) => {
    const date = new Date(limitStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${mins}`;
  };

  const getRemainingTime = (limitStr) => {
    const limit = new Date(limitStr);
    const dateNow = new Date();
    const remainingTime = limit - dateNow;
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${remainingTime > 0 ? days : days + 1} days, ${remainingTime > 0 ? hours : hours + 1} hours, ${
      remainingTime > 0 ? mins : mins + 1
    } minutes`;
  };

  if (isDoneDisplay == 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
              {task.title}
              <br />
              {task.done ? '完了' : '未完了'}
              <br />
              {task.limit
                ? 'You should complete this task by ' + getFormatedTime(task.limit)
                : 'this task has no time limit'}
              <br />
              {task.limit ? getRemainingTime(task.limit) + ' left' : ''}
            </Link>
          </li>
        ))}
    </ul>
  );
};
