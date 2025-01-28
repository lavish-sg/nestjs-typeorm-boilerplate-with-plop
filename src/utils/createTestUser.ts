// import { randomUUID } from 'crypto';
// import { UserService } from '../user/user.service';
// import { ROLES } from '../constants/role-and-permissions';

// export async function createTestUser() {
//     const userService
//   // Create a test user and get the user's ID
//   const user = await userService.createUser({
//     id: randomUUID(),
//     email: 'testuser@example.com',
//     name: 'Test User',
//     isActive: true,
//     jobRole: null,
//     department: null,
//     team: null,
//     isLead: false,
//   });
//   const userId = user.id;

//   const roles = await userHasRolesRepo.save({
//     userId: user.id,
//     roleId: ROLES.find((role) => role.slug === 'execs').id,
//   });
//   console.log('User ID:', user, roles);
// }
