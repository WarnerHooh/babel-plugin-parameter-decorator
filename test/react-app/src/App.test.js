import React from 'react';
import axios from './service/axios';
import { render, fireEvent } from '@testing-library/react';

import App from './App';

describe('App Test', () => {
  it('Should render App Test', () => {
    // given
    const a = jest.spyOn(axios, 'request');
    const { getByText } = render(<App />);
    const button = getByText('Hello');

    // when
    fireEvent.click(button);

    // then
    expect(a).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://api.github.com/',
      method: 'GET',
      url: '/users/WarnerHooh'
    }));
  });
});
