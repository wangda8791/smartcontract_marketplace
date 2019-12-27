import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      marketplace: null,
      productCount: 0,
      products: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
  }

  async componentDidMount() {
    this.loadWeb3();
    this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-dapp browser detected.');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      this.setState({
        account: accounts[0]
      })
    }
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
      const productCount = await marketplace.methods.productCount().call();
      const products = [];
      for (let i=1; i<=productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        products.push(product);
      }
      
      this.setState({
        marketplace,
        productCount,
        products,
        loading: false
      });
    } else {
      window.alert('Marketplace contract net deployed to detected network');
    }
  }

  async createProduct(name, price) {
    this.setState({ loading: true });
    await this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account });
    this.setState({ loading: false });
  }

  async purchaseProduct(id, price) {
    this.setState({ loading: true });
    await this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price });
    this.setState({ loading: false });
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading 
                ? 'Loading... ' 
                : <Main
                    products={this.state.products}
                    createProduct={this.createProduct}
                    purchaseProduct={this.purchaseProduct}
                  />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
