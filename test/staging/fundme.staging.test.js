const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");
const { assert } = require("chai");

describe("integration fundme", async () => {
  let fundme;
  let deployer;
  let sendvalue = ethers.parseEther("0.1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    fundme = await ethers.getContract("FundMe", deployer);
  });
  it("allows people to fund and withdraw", async () => {
    await fundme.fund({ value: sendvalue });
    const transactionResponce = await fundme.withdraw();
    const transactionReciept = await transactionResponce.wait(1);

    console.log(transactionReciept);
    const endingFundMeBalance = await ethers.provider.getBalance(
      fundme.getAddress()
    );
    assert.equal(endingFundMeBalance.toString(), "0");
  });
});
