import assert from 'assert';


// test('just log to console', () => {
//     console.log("test 2 con 2")
//   });
  
describe('Simple Math Test', () => {

    console.log("here in Simple Math Test")
    it('should return 2', () => {
        assert.equal(1 + 1, 2);
    });
    it('should return 9', () => {
        assert.equal(3 * 3, 9);
    });
});