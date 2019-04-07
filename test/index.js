import test from 'ava';
import Greeter from './lib/js';

test('Should the original function work correctly.', t => {
  const greeter = new Greeter('Nice to meet you!');
  const message = greeter.greet('Warner');

  t.is(message, 'Hello Warner, Nice to meet you!');
});

test('Should greet with default greeting.', t => {
  const greeter = new Greeter();
  const message = greeter.greet('Warner');

  t.is(message, 'Hello Warner, how are you?');
});

test('Should throw required error when name not passed.', t => {
  const error = t.throws(() => {
    const greeter = new Greeter('Nice to meet you!');
    const message = greeter.greet();
  }, Error);

  t.is(error.message, 'name is required');
});

test('Should support multiple parameters, validate failed', t => {
  const error = t.throws(() => {
    const greeter = new Greeter();
    const message = greeter.welcome('Hooh');
  }, Error);

  t.is(error.message, 'lastName is required');
});

test('Should support multiple parameters, validate success', t => {
  const greeter = new Greeter();
  const message = greeter.welcome('Hooh', 'Warner');

  t.is(message, 'Welcome Warner.Hooh');
});
