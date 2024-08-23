.PHONY: deploy

deploy :; forge script script/Token.s.sol:TokenScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

balance :; cast balance --erc20 0x5FbDB2315678afecb367f032d93F642f64180aa3 0x70997970C51812dc3A010C7d01b50e0d17dc79C8