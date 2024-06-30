import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { AppModule } from '../../../app.module';
import { DatabaseService } from '../../../database/database.service';
import { userStub } from '../stubs/user.stub';
import { CreateUserRequest } from 'src/users/dto/request/create-user.request.dto';

describe('UsersController (integration)', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDbHandled();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await dbConnection.collection('users').deleteMany({});
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      await dbConnection.collection('users').insertOne(userStub());
      const response = await request(httpServer).get('/users');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject([userStub()]);
    });
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const createUserRequest: CreateUserRequest = {
        email: userStub().email,
        age: userStub().age,
      };

      const response = await request(httpServer)
        .post('/users')
        .send(createUserRequest);

      expect(response.status).toBe(201);

      const user = await dbConnection
        .collection('users')
        .findOne({ email: userStub().email });

      expect(user).toMatchObject(createUserRequest);
    });
  });
});
