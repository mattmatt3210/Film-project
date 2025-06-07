// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MovieRental {
    struct Rental {
        address customer;
        string movieId;
        uint256 price;
        uint256 timestamp;
        uint256 expiryTime;
        bool active;
    }
    
    mapping(bytes32 => Rental) public rentals;
    mapping(address => bytes32[]) public customerRentals;
    
    address public owner;
    uint256 public constant RENTAL_DURATION = 48 hours;
    
    event MovieRented(
        bytes32 indexed rentalId,
        address indexed customer,
        string movieId,
        uint256 price,
        uint256 timestamp
    );
    
    event RentalExpired(bytes32 indexed rentalId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function rentMovie(string memory movieId) external payable {
        require(msg.value > 0, "Payment required");
        
        bytes32 rentalId = keccak256(
            abi.encodePacked(msg.sender, movieId, block.timestamp)
        );
        
        require(!rentals[rentalId].active, "Rental already exists");
        
        rentals[rentalId] = Rental({
            customer: msg.sender,
            movieId: movieId,
            price: msg.value,
            timestamp: block.timestamp,
            expiryTime: block.timestamp + RENTAL_DURATION,
            active: true
        });
        
        customerRentals[msg.sender].push(rentalId);
        
        emit MovieRented(rentalId, msg.sender, movieId, msg.value, block.timestamp);
    }
    
    function isRentalActive(bytes32 rentalId) external view returns (bool) {
        Rental memory rental = rentals[rentalId];
        return rental.active && block.timestamp <= rental.expiryTime;
    }
    
    function getRental(bytes32 rentalId) external view returns (Rental memory) {
        return rentals[rentalId];
    }
    
    function getCustomerRentals(address customer) external view returns (bytes32[] memory) {
        return customerRentals[customer];
    }
    
    function expireRental(bytes32 rentalId) external {
        require(rentals[rentalId].active, "Rental not active");
        require(block.timestamp > rentals[rentalId].expiryTime, "Rental not expired yet");
        
        rentals[rentalId].active = false;
        emit RentalExpired(rentalId);
    }
    
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
