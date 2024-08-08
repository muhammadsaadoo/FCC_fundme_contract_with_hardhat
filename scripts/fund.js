const { getNamedAccounts, ethers } = require("hardhat");
async function main() {
  const { deployer } = await getNamedAccounts;
  const fundme = await ethers.getContract("FundMe", deployer);
  console.log("funding Contract..........");
  console.log(fundme);
  const transactionResponce = await fundme.fund({
    value: ethers.parseEther("0.1"),
  });
  await transactionResponce.wait();
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
