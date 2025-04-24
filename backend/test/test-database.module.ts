import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const createTestDatabaseModule = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  return MongooseModule.forRoot(uri), mongod;
};
