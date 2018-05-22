const assert = require("assert");
const { throttleLock } = require("../");

describe("Unit test", function testCase() {
  this.timeout(300 * 1000);
  describe("sync", () => {
    it("case1.1", async () => {
      const triggerings = [];
      const fn = (arg1, arg2, arg3) =>
        new Promise(resolve => {
          setTimeout(() => {
            triggerings.push(Date.now());
            resolve(arg3);
          }, 1500);
        });

      const fnLocked = throttleLock("test-function", fn, null, 2);
      const res1 = await fnLocked(1, 2, 1);
      const res2 = await fnLocked(1, 2, 2);
      const res3 = await fnLocked(1, 2, 3);
      const res4 = await fnLocked(1, 2, 4);
      assert.equal(triggerings.length, 4);
      assert.equal(res1, 1);
      assert.equal(res2, 2);
      assert.equal(res3, 3);
      assert.equal(res4, 4);
      assert.ok(triggerings[1] - triggerings[0] >= 1500);
      assert.ok(triggerings[2] - triggerings[1] >= 1500);
      assert.ok(triggerings[3] - triggerings[2] >= 1500);
    });
  });

  describe("noraml", () => {
    it("case1.1", async () => {
      const triggerings = [];
      const fn = (arg1, arg2, arg3) =>
        new Promise(resolve => {
          setTimeout(() => {
            triggerings.push(Date.now());
            resolve(arg3);
          }, 1500);
        });

      const fnLocked = throttleLock("test-function", fn, null, 3, 5);
      const res1 = fnLocked(1, 2, 3);
      const res2 = fnLocked(1, 2, 3);
      const res3 = fnLocked(1, 2, 3);
      const res4 = fnLocked(1, 2, 3);
      await res1;
      await res2;
      await res3;
      await res4;
      assert.equal(triggerings.length, 4);
      const earliest = Math.min(...triggerings.slice(0, 3));
      const latest = Math.max(...triggerings.slice(0, 3));
      assert.ok(latest - earliest <= 10);

      assert.ok(triggerings[3] - latest >= 1500);
    });

    it("case1.2", async () => {
      const triggerings = [];
      const fn = (arg1, arg2, arg3) =>
        new Promise(resolve => {
          setTimeout(() => {
            triggerings.push(Date.now());
            resolve(arg3);
          }, 1500);
        });

      const fnLocked = throttleLock("test-function", fn, null, 2, 5);
      const res1 = fnLocked(1, 2, 3);
      const res2 = fnLocked(1, 2, 3);
      const res3 = fnLocked(1, 2, 3);
      const res4 = fnLocked(1, 2, 3);
      await res1;
      await res2;
      await res3;
      await res4;
      assert.equal(triggerings.length, 4);
      assert.ok(triggerings[1] - triggerings[0] <= 10);
      assert.ok(triggerings[3] - triggerings[2] <= 10);
      assert.ok(triggerings[3] - triggerings[1] >= 1500);
    });
  });

  describe("timeout", () => {
    it("case2.1", async () => {
      const triggerings = [];
      const fn = (arg1, arg2, arg3) =>
        new Promise(resolve => {
          setTimeout(() => {
            triggerings.push(Date.now());
            resolve(arg3);
          }, 1500);
        });

      const fnLocked = throttleLock("test-function", fn, null, 1, 4);
      const res1 = fnLocked(1, 2, 1);
      const res2 = fnLocked(1, 2, 2);
      const res3 = fnLocked(1, 2, 3);
      try {
        await fnLocked(1, 2, 4);
      } catch (e) {
        assert.ok(e);
        assert.equal(e.message, "Request lock timeout: 4 s");
      }
      await res1;
      await res2;
      await res3;
    });
  });
});
