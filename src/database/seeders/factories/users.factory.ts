import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersFactory {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  private createUUID(): string {
    return uuidv4();
  }

  async createUsers(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      const newUUID = this.createUUID();
      const userData = {
        id: newUUID,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        jobRole: faker.person.jobTitle(),
        isActive: true,
        department: faker.commerce.department(),
        team: faker.company.name(),
        isLead: faker.datatype.boolean(),
      };

      const existingUser = await this.userRepository.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
      }
    }
  }
}
