pragma solidity ^0.5.7;
//pragma experimental ABIEncoderV2;

import './ERC721Token.sol';

contract Aircraft is ERC721Token {
    
    struct Part {
    uint id;
    string basePN;
    string serialNo;
    uint MFD ;
    string certs;
    bool scrapped;//to set true/false for the purpose of BER.
    
  }
  mapping(uint => Part) public parts;
  uint public nextId;
  address public admin;
  
  constructor(
        string memory _tokenURIBase
   ) ERC721Token( _tokenURIBase) public {
       admin = msg.sender;
       
     }
     
    function partManufactured(string calldata _basePN, string calldata _serialNo, uint _mfd, string calldata _cert) external {
        require(msg.sender == admin, 'only admin');
        parts[nextId] = Part(nextId, _basePN, _serialNo, _mfd, _cert, false);
        _mint(msg.sender, nextId);
         nextId++;
     } 
     
     function toDistributor(address _approved, uint _tokenId) external {
         require (parts[_tokenId].scrapped != true, 'This Part is already scrapped as per record');
         _approve(_approved, _tokenId);
     }
     
     function fromDistributor(address _from, address _to, uint _tokenId) external {
         require (parts[_tokenId].scrapped != true, 'This Part is already scrapped as per record');
     _safeTransferFrom(_from, _to, _tokenId, "");     
     }
     
     function toUser(address _from, address _to, uint _tokenId) external {
         require (parts[_tokenId].scrapped != true, 'This Part is already scrapped as per record');
         _transfer( _from,  _to, _tokenId);
     }
     
     function userToMRO(address _from, address _to, uint _tokenId)external {
         require (parts[_tokenId].scrapped != true, 'This Part is already scrapped as per record');
         _transfer( _from,  _to, _tokenId);
     }
     
     function MROToUser(address _from, address _to, uint _tokenId, string calldata cert, bool _scrapped)external {
          Part[] memory _parts = new Part[](nextId);
      for (uint i = 0; i < _parts.length; i++){
          if (parts[i].id == _tokenId){
            parts[_tokenId].certs = cert;
            parts[_tokenId].scrapped = _scrapped;
          }
          _transfer( _from,  _to, _tokenId);
      }
         
     }
}

