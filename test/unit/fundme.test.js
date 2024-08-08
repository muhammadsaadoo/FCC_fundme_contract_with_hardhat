const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const { provider, utils, GasCostPlugin } = require("ethers");
const {
  deployments,
  ethers,
  getNamedAccounts,
  waffle,
  network,
} = require("hardhat");
const { bigint } = require("hardhat/internal/core/params/argumentTypes");
const { developmentChain } = require("../../helper-hardhat-config");

describe("unit FundMe", async () => {
  //deploy
  let fundme;
  let deployer;
  let mockV3Aggregator;
  const sendvalue = ethers.parseEther("1"); //convert into 1X10power18 mean gwei
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer; //uuse <--- this insted of {deployer}
    await deployments.fixture("all"); //deploy whole folder
    fundme = await ethers.getContract("FundMe", deployer);
    //deploy mockv3aggregator bcz we deploy it on  hardhat
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  //test constructor
  describe("constructor", async () => {
    it("sets the aggregator address correctly", async () => {
      const responce = await fundme.getPriceFeed(); //this will be same as mock pricefeed bcz we deployed on hardhat
      // console.log(responce, mockV3Aggregator.address);
      assert.equal(responce, await mockV3Aggregator.target);
    });
  });
  //test fund()
  describe("fund", async () => {
    it("Fail if u dont send eth!", async () => {
      // await fundme.fund();          //thsi is revert the transaction
      await expect(fundme.fund()).to.be.reverted; //use Waffle test to manage exception
      //when we call a function that have some conditional and if the condition is false
      //then the contract breacks/endedup in that case we use to be reverted
    });
    it("update the fund  value", async () => {
      await fundme.fund({ value: sendvalue });
      const responce = await fundme.getAddressToAmountFunded(deployer);
      // console.log(responce);
      assert.equal(responce.toString(), sendvalue.toString());
    });
    it("add funders to funders array", async () => {
      await fundme.fund({ value: sendvalue });
      const responce = await fundme.getFunder(0);
      // console.log(responce.toString(), deployer.toString());

      assert.equal(responce.toString(), deployer.toString());
    });
  });

  describe("withdraw with single user", async () => {
    beforeEach(async () => {
      await fundme.fund({ value: sendvalue });
    });

    it("withdraw eth from a single founder", async () => {
      // console.log(await fundme.getAddress());
      const startingFundMeBalance = await ethers.provider.getBalance(
        await fundme.getAddress()
      );
      // console.log(startingFundMeBalance);
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );

      // console.log(startingDeployerBalance);
      // console.log(fundme);

      const transactionResponce = await fundme.withdraw();
      // console.log(transactionResponce);
      const transactionReciept = await transactionResponce.wait(1);
      // console.log(transactionReciept);
      const { gasUsed, gasPrice } = transactionReciept;
      // console.log(gasUsed, gasPrice);
      const gasCost = gasUsed * gasPrice;
      // console.log(gasCost);
      // bigint(gasUsed).toString() * bigint(effectiveGasPrice).toString();

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundme.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance + startingDeployerBalance,
        endingDeployerBalance + gasCost
      );
    });
    it("withdraw with multiple funders", async () => {
      //getting accounts
      const accounts = await ethers.getSigners();
      // console.log(accounts);
      // connect all the accounts with contract
      for (let i = 1; i < 5; i++) {
        const connectedAccount = await fundme.connect(accounts[i]);
        // console.log(connectedAccount);
        await fundme.fund({ value: sendvalue });
      }
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundme.getAddress()
      );
      //
      const transactionResponce = await fundme.withdraw();
      const transactionReciept = await transactionResponce.wait();
      const { gasUsed, gasPrice } = transactionReciept;
      const gasCost = gasPrice * gasUsed;
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundme.getAddress()
      );

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance + startingDeployerBalance,
        endingDeployerBalance + gasCost
      );
      //make sure that the funders are reset properly
      await expect(fundme.getFunder(0)).to.be.reverted;
      //make sure in mapping all the address have zero value
      for (let i = 0; i < 5; i++) {
        // console.log(accounts[i].address);
        assert.equal(
          await fundme.getAddressToAmountFunded(accounts[i].address),

          0
        );
      }
    });
    it("only owner can withdraw the ammount", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[2];
      const attackerConnectedtoContract = await fundme.connect(attacker);
      await expect(
        attackerConnectedtoContract.withdraw()
      ).to.be.revertedWithCustomError(fundme, "FundMe__NotOwner");
    });
    it("cheaper withdraw eth from a single founder", async () => {
      // console.log(await fundme.getAddress());
      const startingFundMeBalance = await ethers.provider.getBalance(
        await fundme.getAddress()
      );
      // console.log(startingFundMeBalance);
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );

      // console.log(startingDeployerBalance);
      // console.log(fundme);

      const transactionResponce = await fundme.cheaperWithdraw();
      // console.log(transactionResponce);
      const transactionReciept = await transactionResponce.wait(1);
      // console.log(transactionReciept);
      const { gasUsed, gasPrice } = transactionReciept;
      // console.log(gasUsed, gasPrice);
      const gasCost = gasUsed * gasPrice;
      // console.log(gasCost);
      // bigint(gasUsed).toString() * bigint(effectiveGasPrice).toString();

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundme.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance + startingDeployerBalance,
        endingDeployerBalance + gasCost
      );
    });
    it("withdraw with multiple funders", async () => {
      //getting accounts
      const accounts = await ethers.getSigners();
      // console.log(accounts);
      // connect all the accounts with contract
      for (let i = 1; i < 5; i++) {
        const connectedAccount = await fundme.connect(accounts[i]);
        // console.log(connectedAccount);
        await fundme.fund({ value: sendvalue });
      }
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundme.getAddress()
      );
      //
      const transactionResponce = await fundme.cheaperWithdraw();
      const transactionReciept = await transactionResponce.wait();
      const { gasUsed, gasPrice } = transactionReciept;
      const gasCost = gasPrice * gasUsed;
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundme.getAddress()
      );

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance + startingDeployerBalance,
        endingDeployerBalance + gasCost
      );
      //make sure that the funders are reset properly
      await expect(fundme.getFunder(0)).to.be.reverted;
      //make sure in mapping all the address have zero value
      for (let i = 0; i < 5; i++) {
        // console.log(accounts[i].address);
        assert.equal(
          await fundme.getAddressToAmountFunded(accounts[i].address),

          0
        );
      }
    });
    it("getVersion", async () => {
      const version = await fundme.getVersion();
      // console.log(version);
      assert.equal(version, 0);
    });
    it("getOwner", async () => {
      const owner = await fundme.getOwner();
      assert.equal(owner, deployer);
    });
  });
  //
  //
});
