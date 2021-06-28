const { expect } = require("chai");

let Token, tokenContract ;
let owner, account1, account2;

beforeEach("", async () => {
    [owner, account1, account2, ...accounts] = await ethers.getSigners();
    Token = await ethers.getContractFactory("Token");
    tokenContract = await Token.deploy();
});


describe('Deployment', () => {
    it('Should set the right owner', async () => {        
        expect(await tokenContract.owner()).to.equal(owner.address);        
    });

    it('Should assign the total supply of tokens to the owner', async () => {
        expect(await tokenContract.balanceOf(owner.address)).to.equal(await tokenContract.totalSupply());        
    });
});

describe('Transactions', () => {
    let amount1 = 50;
    let amount2 = 30;     

    it('Should transfer Tokens between accounts', async () => {
        //Transfer from owner account to another 
        await tokenContract.transfer(account1.address, amount1);
        expect(await tokenContract.balanceOf(account1.address)).to.equal(amount1);

        //Transfer tokens between accounts
        await tokenContract.connect(account1).transfer(account2.address, amount2);
        expect(await tokenContract.balanceOf(account1.address)).to.equal(amount1 - amount2);
        expect(await tokenContract.balanceOf(account2.address)).to.equal(amount2);
    });

    it("Should fail if sender doesn't have enough tokens", async () => {

        await expect( 
            tokenContract.connect(account1).transfer(account2.address, 10)
        ).to.be.revertedWith("Not enough Tokens");
        
    });
    
    it('Should update balances after transfers', async () => {
        //-----------------------------Arrange-----------------------------
        const amount1 = 100;
        const amount2 = 50;
        const initalOwnerBalance = await tokenContract.balanceOf(owner.address);


        //-----------------------------Act-----------------------------
        //Transfer from owner account to another 
        await tokenContract.transfer(account1.address, amount1);

         //Transfer tokens between accounts
        await tokenContract.connect(account1).transfer(account2.address, amount2);       
        
        //-----------------------------Assert-----------------------------
        const finalOwnerBalance = await tokenContract.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initalOwnerBalance - amount1, "Owner balance is not correct");

        const account1Balance = await tokenContract.balanceOf(account1.address);
        expect(account1Balance).to.equal(amount1 - amount2);

        const account2Balance = await tokenContract.balanceOf(account2.address);
        expect(account2Balance).to.equal(amount2);
    });    
});