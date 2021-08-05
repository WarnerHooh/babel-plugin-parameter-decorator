import axios from './axios';
// Class, method, parameter decorators of HTTP request, more details: https://github.com/WarnerHooh/HttpClient
import HttpClient, { Path, GET, Controller } from 'http-clienti';

@Controller('/users')
class UserService extends HttpClient {
  constructor() {
    super(axios);
  }

  @GET('/:username')
  fetchUser(@Path('username') username) {
  }
}

const singleton = new UserService();

export default singleton;
