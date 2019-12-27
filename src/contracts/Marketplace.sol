pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    function createProduct(string memory _name, uint _price) public {
        // Require a valid name
        require(bytes(_name).length > 0, 'name should not be empty');
        // Require a valid price
        require(_price > 0, 'price should be greater than zero');
        // Increment product count
        productCount ++;
        // Create the product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        // Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        // Make sure the product has a valid id
        require(_id >= 1 && _id <= productCount, 'id is invalid');
        // Fetch the product
        Product memory _product = products[_id];
        // Require that there is enough Ether in the transaction
        require(msg.value >= _product.price, 'value of transaction is not enough');
        // Require that the proudct has not been purchased
        require(!_product.purchased, 'product is already purchased');
        // Fetch the owner
        address payable _seller = _product.owner;
        // Require ownership to the buy
        require(_seller != msg.sender, 'cannot buy own product');
        // Transfer ownerhsip to the buy
        _product.owner = msg.sender;
        // Make as purchased
        _product.purchased = true;
        // Update the product
        products[_id] = _product;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, _product.owner, _product.purchased);
    }
}
