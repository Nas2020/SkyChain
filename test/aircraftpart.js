const { expectRevert } = require('@openzeppelin/test-helpers');
const Part = artifacts.require('Aircraft');

contract('Part', accounts => {
  let part;
  const [admin, user1, MRO, distributor, user2] = [accounts[0], accounts[1], accounts[2], accounts[3], accounts[4]];

  beforeEach(async () => {
    part = await Part.new('https://www.nlmuasys.com');
  });

  it('should NOT create part token if not admin', async () => {
    await expectRevert(
      part.partManufactured("ABC", "ABC1", 1, "FAA",{from: user1}), 
      'only admin'
    );
  });

  it('Should create part token', async () => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    const nextId = await part.nextId.call(); 
    assert(nextId.toNumber() === 1);

    const part1 = await part.parts.call(0);
    assert(part1.id.toNumber() === 0); 
    assert(part1.basePN === 'ABC');
    assert(part1.serialNo === 'DEF');
    assert(part1.MFD.toNumber() === 123);
    assert(part1.certs === 'FAA');
    assert(part1.scrapped === false);
  });
  it('Should NOT transfer the token to another user', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    await part.userToMRO(user1, MRO, 0, {from: user1});
    //scrapped bool set to true
    await part.MROToUser(MRO, user1, 0,'Scrapped', true, {from: MRO});
    async () => {
      await expectRevert(
        await part.toUser(user1, MRO, 0, {from: user1}), 'This Part is already scrapped as per record'
      );
      }
  });
  it('Should transfer the token to another user', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    const address = await part.ownerOf(0);
    assert(address == user1);
  });
  //method toDistributor
  it('Should NOT pass the Approval to distributor, if scrapped value is true', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    await part.userToMRO(user1, MRO, 0, {from: user1});
    //scrapped bool set to true
    await part.MROToUser(MRO, user1, 0,'Scrapped', true, {from: MRO});
    async () => {
      await expectRevert(
        await part.toDistributor(user2, 0, {from: user1}), 'This Part is already scrapped as per record'
      );
      }
  });

  it('Should pass the Approval to distributor if scrapped value is false', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toDistributor(distributor, 0, {from:admin});
    await part.fromDistributor(admin, user1, 0, {from: distributor});
    const address = await part.ownerOf(0);
    assert(address == user1);
  });
  //method fromDistributor
  it('Should NOT distribute the part if scrapped value is true', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    await part.userToMRO(user1, MRO, 0, {from: user1});
    //scrapped bool set to true
    await part.MROToUser(MRO, user1, 0,'Scrapped', true, {from: MRO});
    async () => {
      await expectRevert(
        await part.fromDistributor(user1, user2, 0, {from: distributor}), 'This Part is already scrapped as per record'
      );
      }
  });
  it('Should distribute the part on behalf of customer', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toDistributor(distributor, 0, {from:admin});
    await part.fromDistributor(admin, user1, 0, {from: distributor});
    const address = await part.ownerOf(0);
    assert(address == user1);
  });
  //method userToMRO
  it('Should NOT transfer the token to MRO', async() => {
    
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    await part.userToMRO(user1, MRO, 0, {from: user1});
    //scrapped bool set to true
    await part.MROToUser(MRO, user1, 0,'Scrapped', true, {from: MRO});
    async () => {
      await expectRevert(
        await part.userToMRO(user1, MRO, 0, {from: user1}), 'This Part is already scrapped as per record'
      );
      }
  });
  it('Should transfer the token to MRO', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    await part.userToMRO(user1, MRO, 0, {from: user1});
    const address = await part.ownerOf(0);
    assert(address == MRO);
  });
  //method MROToUser
  it('Should transfer the token to user', async() => {
    await part.partManufactured('ABC','DEF',123,'FAA');
    await part.toUser(admin, user1, 0, {from: admin});
    await part.userToMRO(user1, MRO, 0, {from: user1});
    //Scrapped bool false.
    await part.MROToUser(MRO, user1, 0,'CAAS', false, {from: MRO});
    const address = await part.ownerOf(0); 
    const part1 = await part.parts.call(0);
    assert(address == user1); //Owner of Token 0 is user1 now.
    //make sure MRO cert is updated!
    assert(part1.certs === 'CAAS');
  });
  
});


