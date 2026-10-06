import { Test, TestingModule } from '@nestjs/testing';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '#app/app.module.js';

describe('Movements controller (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  describe('Validate', () => {
    const uri = '/movements/validation';
    describe('Request validation failures', () => {
      const requestValidationFailures = [
        {
          name: 'Empty body',
          body: {},
          expectedResponse: {
            'error': 'Bad Request',
            'message': [
              'movements must be an array',
              'balances must be an array',
            ],
            'statusCode': 400,
          },
        },
        {
          name: 'Missing movements',
          body: {
            balances: [],
          },
          expectedResponse: {
            'error': 'Bad Request',
            'message': [
              'movements must be an array',
            ],
            'statusCode': 400,
          },
        },
        {
          name: 'Missing balances',
          body: {
            movements: [],
          },
          expectedResponse: {
            'error': 'Bad Request',
            'message': [
              'balances must be an array',
            ],
            'statusCode': 400,
          },
        },
        {
          name: 'Missing movement id',
          body: {
            movements: [
              {amount: 15.5, wording: 'Mov-x-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.id must be an integer number',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Invalid movement id',
          body: {
            movements: [
              {id: 'Test', amount: 15.5, wording: 'Mov-x-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.id must be an integer number',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Missing movement amount',
          body: {
            movements: [
              {id: 1, wording: 'Mov-1-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2016-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.amount must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Invalid movement amount',
          body: {
            movements: [
              {id: 1, amount: 'Test', wording: 'Mov-1-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2016-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.amount must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Missing movement wording',
          body: {
            movements: [
              {id: 1, amount: 15.5, date: '2026-10-05'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.wording must be a string',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Missing movement date',
          body: {
            movements: [
              {id: 1, amount: 15.5, wording: 'Mov-1'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.date must be a Date instance',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Invalid movement date',
          body: {
            movements: [
              {id: 1, amount: 15.5, wording: 'Mov-1', date: 'Test'},
            ],
            balances: [
              {balance: 0, date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'movements.0.date must be a Date instance',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Missing balance value',
          body: {
            movements: [
              {id: 1, amount: 15.5, wording: 'Mov-x-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'balances.0.balance must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Invalid balance value',
          body: {
            movements: [
              {id: 1, amount: 15.5, wording: 'Mov-x-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 'Test', date: '2026-10-01'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'balances.0.balance must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Missing balance date',
          body: {
            movements: [
              {id: 1, amount: 15.5, wording: 'Mov-x-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 0},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'balances.0.date must be a Date instance',
            ],
            statusCode: 400,
          },
        },
        {
          name: 'Invalid balance date',
          body: {
            movements: [
              {id: 1, amount: 15.5, wording: 'Mov-x-2026-10-05', date: '2026-10-05'},
            ],
            balances: [
              {balance: 0, date: 'Test'},
              {balance: 15.5, date: '2026-10-06'},
            ],
          },
          expectedResponse: {
            error: 'Bad Request',
            message: [
              'balances.0.date must be a Date instance',
            ],
            statusCode: 400,
          },
        },
      ];
      it.each(requestValidationFailures)(
        'Should fail validation request for: $name',
        async ({body, expectedResponse}) => {
          await request(app.getHttpServer())
            .post(uri)
            .send(body)
            .expect(400)
            .expect(expectedResponse);
        }
      );
    });
    describe('Validation success', () => {
      it('Should pass validation with empty movements and balances', () => {
        return request(app.getHttpServer())
          .post(uri)
          .send(
            {
              movements: [],
              balances: [],
            }
          )
          .expect(200)
          .expect(
            { message: 'Accepted' },
          );
      });
      it('Should pass validation with valid movements and balances', () => {
        return request(app.getHttpServer())
          .post(uri)
          .send(
            {
              movements: [
                {
                  id: 1,
                  amount: 10.3,
                  wording: '1-20-09-2026',
                  date: '2026-09-20',
                },
                {
                  id: 2,
                  amount: 5.1,
                  wording: '2-24-09-2026',
                  date: '2026-09-24',
                },
                {
                  id: 3,
                  amount: -3,
                  wording: '3-26-09-2026',
                  date: '2026-09-26',
                },
                {
                  id: 4,
                  amount: 11.7,
                  wording: '4-30-09-2026',
                  date: '2026-09-30',
                },
              ],
              balances: [
                { balance: 0, date: '2026-09-19' },
                { balance: 15.4, date: '2026-09-25' },
                { balance: 24.1, date: '2026-10-01' },
              ],
            }
          )
          .expect(200)
          .expect(
            { message: 'Accepted' },
          );
      });
    });
    describe('Validation failure', () => {
      it('Should display validation failed message and reasons on failure', () => {
        return request(app.getHttpServer())
          .post(uri)
          .send(
            {
              movements: [
                {
                  id: 1,
                  amount: 10.3,
                  wording: '1-18-09-2026',
                  date: '2026-09-18',
                },
                {
                  id: 2,
                  amount: 5.1,
                  wording: '2-24-09-2026',
                  date: '2026-09-24',
                },
                {
                  id: 3,
                  amount: -3,
                  wording: '3-26-09-2026',
                  date: '2026-09-26',
                },
                {
                  id: 4,
                  amount: 11.7,
                  wording: '4-30-09-2026',
                  date: '2026-09-30',
                },
                {
                  id: 4,
                  amount: 11.7,
                  wording: '4-30-09-2026',
                  date: '2026-09-30',
                },
              ],
              balances: [
                { balance: 0, date: '2026-09-19' },
                { balance: 15.4, date: '2026-09-25' },
                { balance: 24.1, date: '2026-10-01' },
              ],
            }
          )
          .expect(422)
          .expect(
            {
              message: 'Validation failed',
              reasons: [
                { type: 'DUPLICATE_MOVEMENTS', message: 'Duplicate ids: 4' },
                {
                  type: 'BALANCE_DISCREPANCY',
                  message: 'Balance discrepancy. Expected: 15.4 Actual: 5.1. Period start: 19/09/2026, period end: 25/09/2026'
                },
                {
                  type: 'BALANCE_DISCREPANCY',
                  message: 'Balance discrepancy. Expected: 24.1 Actual: 35.8. Period start: 25/09/2026, period end: 01/10/2026'
                },
                { type: 'UNCHECKED_MOVEMENTS', message: 'Unchecked movements: 1' }
              ],
            },
          );
      });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
