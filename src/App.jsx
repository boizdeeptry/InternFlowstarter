import { useEffect, useState, useRef } from "react";
import "./App.css";
import Loading from "./components/Loading/Loading";
import CardItem from "./components/CardItem/CardItem";

import { create } from "ipfs-http-client";
import { ethers } from "ethers";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { data } from "./HeroFi";
import { address, sex, generation, heroClass, star } from "./constants";

function App() {
  const [addressAccount, setAddressAccount] = useState("");
  const [allHeroes, setAllHeroes] = useState([]);
  const [dataInput, setDataInput] = useState({
    avatar: "",
    heroClass: "0",
    sex: "0",
    generation: "0",
    star: "0",
  });

  /* Mobile Detail Modal */
  const [modalData, setModalData] = useState({
    heroClass: "",
    sex: "",
    generation: "",
    star: "",
  });

  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [transferAccount, setTransferAccount] = useState("");
  const [transferData, setTransferData] = useState({});

  /* Loading */
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const [disabled, setDisabled] = useState(true);

  /* Input ref */
  const inputRef = useRef();

  /* Create ipfs Image */
  const client = create("https://ipfs.infura.io:5001/api/v0");

  async function onChangeImage(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setDataInput({
        ...dataInput,
        avatar: url,
      });
    } catch (error) {
      toast(`Loi upload: ${error} !`);
    }
  }

  /* Connect MetaMask */
  const connectMetaMask = async () => {
    try {
      const account = await signer.getAddress();
      setAddressAccount(account);
      toast("Ket noi MetaMask thanh cong !");
    } catch (error) {
      toast("Ket noi MetaMask that bai !");
      throw error;
    }
  };

  /* Get All Heroes method */
  const getAllHeroes = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setSigner(signer);
      const contractRes = new ethers.Contract(address, data.abi, signer);
      setContract(contractRes);
      const heroRes = await contractRes.getAllHeroes();
      const heroResExecuted = heroRes.map((item) => Object.assign({}, item));
      setAllHeroes([...heroResExecuted]);
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  /* Get All Heroes Account method */
  const getAllHeroesAccount = async () => {
    try {
      setLoading(true);
      const heroAccountRes = await contract.getHeroesOfAccount();
      setAllHeroes([...heroAccountRes]);
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  /* Create Hero method */
  const createHero = async (e) => {
    e.preventDefault();
    try {
      const { avatar, heroClass, sex, generation, star } = dataInput;
      if (avatar === "") toast("Vui long chon anh !");
      else {
        const res = await contract.createHero(
          avatar,
          heroClass,
          sex,
          generation,
          star
        );
        const { status } = await res.wait();
        if (status === 1) {
          getAllHeroesAccount();
        } else {
          toast("Tao hero that bai !");
        }
      }
    } catch (error) {
      toast("Tao hero that bai !");
      throw error;
    }
  };

  /* Transfer Hero method */
  const transferHero = async (e) => {
    e.preventDefault();
    if (addressAccount === "") toast("Hay ket noi voi MetaMask truoc !");
    else {
      if (transferAccount === "") toast("Hay nhap tai khoan nhan !");
      else {
        try {
          /* 0x46431225342257388cA3FD6248C0db14D055bb4c */
          const res = await contract.transferHero(
            addressAccount,
            transferAccount,
            transferData.id._hex
          );
          console.log("Transfer");
          const { status } = await res.wait();
          if (status === 1) {
            toast("Chuyen doi thanh cong !");
            setTransferAccount("");
            setToggle(false);
            getAllHeroesAccount();
          } else {
            toast("Chuyen doi that bai !");
          }
        } catch (error) {
          toast("Chuyen doi that bai !");
          throw error;
        }
      }
    }
  };

  const setTransferDataCb = (item) => {
    setTransferData(item);
  };

  const setModalDataCb = (item) => {
    setModalData({
      ...modalData,
      heroClass: heroClass.find((item2) => item2.value === item.class).label,
      sex: sex.find((item2) => item2.value === item.sex).label,
      generation: generation.find((item2) => item2.value === item.generation)
        .label,
      star: star.find((item2) => item2.value === item.star).label,
    });
  };

  const setToggleCb = () => {
    setToggle(!toggle);
  };

  const setToggle2Cb = () => {
    setToggle2(!toggle2);
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
      getAllHeroes();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputRef.current.focus();
  }, [toggle]);

  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={4000}
        pauseOnHover={false}
      />

      <form className="form">
        <div className="form-group">
          <label htmlFor="avatar">Avatar:</label>
          <input type="file" id="avatar" onChange={onChangeImage} />
        </div>
        <div className="form-group">
          <label htmlFor="class">Class:</label>
          <select
            id="class"
            onChange={(e) =>
              setDataInput({ ...dataInput, heroClass: e.target.value })
            }
          >
            {heroClass.map((item, index) => {
              return (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="sex">Sex:</label>
          <select
            id="sex"
            onChange={(e) =>
              setDataInput({ ...dataInput, sex: e.target.value })
            }
          >
            {sex.map((item, index) => {
              return (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="generation">Generation:</label>
          <select
            id="generation"
            onChange={(e) =>
              setDataInput({ ...dataInput, generation: e.target.value })
            }
          >
            {generation.map((item, index) => {
              return (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="star">Star:</label>
          <select
            id="star"
            onChange={(e) =>
              setDataInput({ ...dataInput, star: e.target.value })
            }
          >
            {star.map((item, index) => {
              return (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
        </div>
        <button
          type="submit"
          className="btn btn--createheroes"
          onClick={createHero}
          disabled={disabled}
          style={{ borderRadius: "4px", padding: "10px 20px" }}
        >
          Create Hero
        </button>
      </form>

      <div className="container">
        <div className="container-top">
          <div>
            {/* Get All Heroes */}
            <button
              className="btn"
              style={{ borderRadius: "4px", padding: "10px 20px" }}
              onClick={getAllHeroes}
            >
              All Heroes
            </button>
            {/* Get All Heroes Of Account */}
            <button
              style={{ borderRadius: "4px", padding: "10px 20px" }}
              className="btn btn--myheroes"
              onClick={getAllHeroesAccount}
              disabled={disabled}
            >
              My Heroes
            </button>
          </div>
          {addressAccount.length === 0 ? (
            <a
              href="/#"
              style={{
                padding: "12px 24px",
                textDecoration: "none",
                backgroundColor: "#6c757d",
                color: "#ffffff",
                borderRadius: "4px",
              }}
              onClick={(event) => {
                connectMetaMask(event);
                setDisabled(!disabled);
              }}
            >
              Connect MetaMask
            </a>
          ) : (
            <div className="container-top-address">{`Address: ${addressAccount}`}</div>
          )}
        </div>
        <div className="container-bottom">
          <ul className="container-list">
            {loading ? (
              <Loading />
            ) : allHeroes.length === 0 ? (
              "No Heroes"
            ) : (
              allHeroes.map((item, index) => (
                <CardItem
                  key={index}
                  item={item}
                  setTransferDataCb={setTransferDataCb}
                  setModalDataCb={setModalDataCb}
                  setToggleCb={setToggleCb}
                  setToggle2Cb={setToggle2Cb}
                />
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Transfer Modal */}
      <div className={toggle ? "transfer-modal active" : "transfer-modal"}>
        <div
          className="transfer-modal-overlay"
          onClick={() => {
            setToggle(false);
          }}
        ></div>
        <div className="transfer">
          <form className="transfer-form">
            <i
              style={{ marginBottom: "10px" }}
              className="fa-solid fa-xmark transfer-form-icon"
              onClick={(e) => {
                e.preventDefault();
                setToggle(!toggle);
              }}
            ></i>
            <input
              type="text"
              style={{
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #6c757d",
              }}
              placeholder="Nhap dia chi vi..."
              ref={inputRef}
              value={transferAccount}
              onChange={(e) => setTransferAccount(e.target.value)}
            />
            <div
              className="transfer-button-wrap"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button
                type="submit"
                className="transfer-button transfer-button--transfer"
                onClick={(e) => transferHero(e)}
                style={{ borderRadius: "4px" }}
              >
                Transfer
              </button>
              <button
                type="reset"
                className="transfer-button transfer-button--cancel"
                style={{ borderRadius: "4px" }}
                onClick={() => {
                  inputRef.current.focus();
                  setTransferAccount("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Detail Modal */}
      <div className={toggle2 ? "detail-modal active" : "detail-modal"}>
        <div
          className="detail-modal-overlay"
          onClick={() => {
            setToggle2(false);
          }}
        ></div>
        <div className="detail-modal-container">
          <i
            className="fa-solid fa-xmark detail-modal-icon"
            onClick={() => setToggle2(false)}
          ></i>
          <div className="detail-modal-data">
            <span>
              Class:
              <span>{modalData.heroClass}</span>
            </span>
            <span>
              Sex:
              <span>{modalData.sex}</span>
            </span>
            <span>
              Generation:
              <span>{modalData.generation}</span>
            </span>
            <span>
              Star:
              <span>{modalData.star}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
