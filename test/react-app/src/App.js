import React from 'react';
import userService from './service/UserService';

const App = () => {
  const [user, setUser] = React.useState();

  const onFetch = async () => {
    const { data } = await userService.fetchUser('WarnerHooh');
    setUser(data);
  }

  return (
    <div>
      {
        user ? (
          <div>
            <h1>Hello, I am { user.name }</h1>
          </div>
        ) : <button onClick={onFetch}>Hello 🤝</button>
      }
    </div>
  );
};

export default App;
