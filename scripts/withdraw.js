const { getNamedAccounts } = require("hardhat");
async function main() {
  const { deployer } = await getNamedAccounts;
  const fundme = await ethers.getContract("FundMe", deployer);
  const transactionResponce = await fundme.withdraw();
  await transactionResponce.wait(1);
  console.log("withdraw successfully");
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
