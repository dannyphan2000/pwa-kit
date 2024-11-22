jest.mock('https', () => {
    return {
      request: jest.fn((url, options, callback) => {
        const response = {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(response.data);
            } else if (event === 'end') {
              callback();
            } else if (event === 'on') {
              callback();
            }}),
          statusCode: 200,
          headers: {},
          data: '{ "data": "test" }',
        };
  
        callback(response);
      }),
    };
  });
import { emailLink } from './marketing-cloud-email-link'

describe('emailLink()', () => {
  it('should send an email with a magic link', async () => {
    const result = await emailLink('test@example.com', '123', 'https://magic-link.example.com');

    expect(result).toEqual({ data: "test" });
  });
});
