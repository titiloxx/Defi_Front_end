import React, { useEffect, useState } from 'react'
import { AbiItem } from 'web3-utils'
import DefiJSONContract from "../abis/EthSwap.json"
import TokenJSONContract from "../abis/Token.json"
import './App.css'
import 'web3/dist/web3.min.js'
import {Contract} from 'web3-eth-contract';
// @ts-ignore
import Web3 from 'web3'
import Navbar from './navbar'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

declare let window: any;
interface Networks {
  [index: number]: {
    address:string;
  };
}

//Interfaces
interface Account{
  id:string,
  ethBalance?:string,
}

const connectWallet=async ()=>{
  window.web3= new window.Web3(window.ethereum)
  await window.ethereum.enable()
}

const buyToken=async (methods:any,amount:string,account:String,setReload:any)=>{
  const result=(await methods.buyToken(amount).send({from:account,value:0})).
  on('transactionHash', (hash:any) => {setReload(Math.random()*10000)})
}

const sellToken=async (methods:any,amount:string,approve:any,ethswapAddr:String,account:String,setReload:any)=>{
  await approve(ethswapAddr,amount).send({from:account});
  const result=(await methods.sellToken(amount).send({from:account})).
  on('transactionHash', (hash:any) => {setReload(Math.random()*10000)})
}

function App() {
  const [account, setAccount] = useState<Account>();
  const [web3, setWeb3] = useState<Web3>(new window.Web3(window.ethereum));
  const [defiContract, setDefiContract] = useState<Contract>();
  const [tokenContract, setTokenContract] = useState<Contract>();
  const [loxxBalance, setLoxxBalance] = useState<number>(0);
  const [availableTokens, setAvailableTokens] = useState<number>(0);
  const [reload, setReload] = useState<number>();

  useEffect(()=>{
    setWeb3(web3);
    (async ()=>{    
      await window.ethereum.enable();
    })()
  },[])

  //InitAccountInformation
  useEffect(()=>{
    if (web3){
      const loadAccount=async (setAccount:(account:Account)=>void)=>{
        const account =  await web3.eth.getAccounts()
        const balance =  await web3.eth.getBalance(`${account}`)
        setAccount({id:account[0],ethBalance:(parseInt(balance)/10e17).toFixed(4)})
      }
      loadAccount(setAccount);
    }
  },[web3])
  //InitContract
  useEffect(()=>{
    if (account){
      (async ()=>{
        //Defi
        const abi=DefiJSONContract.abi;
        const networkId=await web3.eth.net.getId();
        const networks=DefiJSONContract.networks as Networks;
        if(networks[networkId]){
          const address=networks[networkId].address;
          const defiContract=new web3.eth.Contract(abi as AbiItem[],address)
          const avaiableTokens=await defiContract.methods.tokensLeft().call()
          setAvailableTokens(avaiableTokens)
          setDefiContract(defiContract);
        }
        else{
          alert('There is no network avaiable to use the contract')
        }
      })();
      (async ()=>{
        //Defi
        const abi=TokenJSONContract.abi;
        const networkId=await web3.eth.net.getId();
        const networks=TokenJSONContract.networks as Networks;
        if(networks[networkId]){
          const address=networks[networkId].address;
          const tokenContract=new web3.eth.Contract(abi as AbiItem[],address)
          setTokenContract(tokenContract);
          const balance=await tokenContract.methods.balanceOf(account.id).call()
          setLoxxBalance(balance)
        }
        else{
          alert('There is no network avaiable to use the contract')
        }
      })();
    }
  },[account,reload])

  console.log(account?.id,account?.ethBalance)
  return (
    <div className="App">
      <Navbar address={account?.id} avaiableTokens={availableTokens}/>
      <h4 style={{textAlign:'left'}}>Tokens available: {availableTokens}</h4>
      <br></br>
      <h2>You have {loxxBalance} Loxx</h2>
      <Button 
        variant="outline-primary" 
        onClick={()=>{buyToken(defiContract.methods,"1",account?.id,setReload)}}>Get token</Button>{' '}
      <Button 
      onClick={()=>sellToken(defiContract.methods,"1",tokenContract?.methods.approve,defiContract?.options.address,account?.id,setReload)}
      disabled={loxxBalance<=0} variant="outline-primary">Release token</Button>{' '}
    </div>
  )
}

export default App
