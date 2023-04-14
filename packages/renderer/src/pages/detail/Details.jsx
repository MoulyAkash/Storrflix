// @ts-nocheck
import React, { useState, useEffect, useContext } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import LoadingIcons from "react-loading-icons";

import { Button, message } from "antd";

import tmdbApi from "../../api/tmdbApi";
import apiConfig from "../../api/apiConfig";
import getTMDB from "../../modules/fetchMovieMagnets";
import { add } from "../../modules/torrent";

import "./details.scss";
import CastList from "./CastList";
import VideoList from "./VideoList";
import MovieList from "../../components/movie-list/MovieList";

import { LibraryContext, w2gContext } from "../../GlobalContext";

const Details = () => {
  const navigate = useNavigate();
  const { library, setLibrary } = useContext(LibraryContext);
  const { w2gEnabled, setW2gEnabled } = useContext(w2gContext);
  const [isPresentInLibrary, setIsPresentInLibrary] = useState(false);
  const [isWatchEnabled, setIsWatchEnabled] = useState(false);

  const { category, id, name } = useParams();

  const [item, setItem] = useState(null);

  const [rarbgItems, setRarbgItems] = useState([]);

  useEffect(() => {
    const getDetail = async () => {
      const response = await tmdbApi.detail(category, id, { params: {} });
      setItem(response);
    };

    const getTMDBMagnets = async () => {
      const response = await getTMDB(id, category);
      //   const response = await getTMDB(name, "test");
      setRarbgItems(response);
    };

    getDetail();
    getTMDBMagnets();
  }, [category, id]);

  useEffect(() => {
    checkPresenceInLibrary();
  }, [item]);

  useEffect(() => {
    if (rarbgItems != null) {
      rarbgItems.sort(function (a, b) {
        return b.seeders - a.seeders;
      });
      for (let i = 0; i < rarbgItems.length; i++) {
        if (
          !rarbgItems[i].title.includes("DTC") &&
          !rarbgItems[i].title.includes("REMUX") &&
          !rarbgItems[i].title.includes("2160p") &&
          !rarbgItems[i].title.includes("4K") &&
          !rarbgItems[i].title.includes("HEVC") &&
          !rarbgItems[i].title.includes("DTS") &&
          !rarbgItems[i].title.includes("H.265") &&
          !rarbgItems[i].title.includes("EAC3") &&
          !rarbgItems[i].title.includes("DDP5") &&
          !rarbgItems[i].title.includes("DDP") &&
          !rarbgItems[i].title.includes("Atmos") &&
          !rarbgItems[i].title.includes("ATMOS") &&
          !rarbgItems[i].title.includes("CAKES") &&
          !rarbgItems[i].title.includes("x265") &&
          !rarbgItems[i].title.includes("X265")
        ) {
          add(rarbgItems[i].download || rarbgItems[i].magnet);
          if (w2gEnabled === "host") {
            document.dispatchEvent(
              new CustomEvent("w2gInit", {
                detail: {
                  type: "addTorrent",
                  torrent: rarbgItems[i].download || rarbgItems[i].magnet,
                },
              })
            );
          }
          //   add("magnet:?xt=urn:btih:4dc5ff0a9c6e74ff841c87d126e7790781cbe287&dn=%5BErai-raws%5D%20Spy%20x%20Family%20-%2001%20%5B1080p%5D%5BMultiple%20Subtitle%5D%5B24A04FB0%5D.mkv&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce");
          break;
        }
      }
    }
  }, [rarbgItems]);

  console.log(item);

  useEffect(() => {
    document.addEventListener("torrentHosting", handleEvent);
  }, []);

  function handleEvent(e) {
    console.log(e.detail);
    if (e.detail.isDone === "true") {
      setIsWatchEnabled(true);
    }
    const hide = message.success("Torrent added successfully", 0);
    // Dismiss manually and asynchronously
    setTimeout(hide, 2500);
  }

  const addToLibrary = () => {
    for (let i = 0; i < library.length; i++) {
      if (library[i].id === item.id) return;
    }
    library.push({ ...item, category });
    console.log("Current library: ", library);
  };

  const removeFromLibrary = () => {
    for (let i = 0; i < library.length; i++) {
      if (library[i].id === item.id) {
        library.splice(i, 1);
        return;
      }
    }
    console.log("Current library: ", library);
  };

  const downloadFile = () => {
    alert("Hello world");
  };

  const success = () => {
    const hide = message.loading("Download commencing...", 0);
    // Dismiss manually and asynchronously
    setTimeout(hide, 2500);
  };

  const checkPresenceInLibrary = () => {
    if (item === null) return;
    for (let i = 0; i < library.length; i++) {
      if (library[i].id === item.id) {
        console.log("Here");
        setIsPresentInLibrary(true);
        return;
      }
    }
    setIsPresentInLibrary(false);
  };

  const onWatch = () => {
    if (isWatchEnabled) {
      navigate("/player/" + category + "/" + item.id);
      if (w2gEnabled === "host") {
        document.dispatchEvent(
          new CustomEvent("w2gInit", {
            detail: {
              type: "watchNow",
              path: "/player/" + category + "/" + item.id,
            },
          })
        );
      }
    } else {
      const hide = message.loading(
        "Torrents are being fetched, please wait...",
        0
      );
      // Dismiss manually and asynchronously
      setTimeout(hide, 2500);
    }
  };

  console.log(rarbgItems);

  return (
    <>
      {item && (
        <>
          <div
            className="banner"
            style={{
              backgroundImage: `url(${apiConfig.originalImage(
                item.backdrop_path || item.poster_path
              )})`,
            }}
          ></div>
          <div className="movie-content container">
            <div className="movie-content__poster">
              <div
                className="movie-content__poster__img"
                style={{
                  backgroundImage: `url(${apiConfig.originalImage(
                    item.poster_path || item.backdrop_path
                  )})`,
                }}
              ></div>
            </div>
            <div className="movie-content__info">
              <h1 className="title">{item.title || item.name}</h1>
              <div className="genres">
                {item.genres &&
                  item.genres.slice(0, 5).map((genre, i) => {
                    return (
                      <span key={i} className="genres__item">
                        {genre.name}
                      </span>
                    );
                  })}
              </div>
              <p className="overview">{item.overview}</p>
              <div
                style={{
                  width: "70%",
                  display: "flex",
                }}
              >
                <div
                  className="genres__item"
                  style={{ color: "white", cursor: "pointer" }}
                  onClick={onWatch}
                >
                  {isWatchEnabled ? (
                    "Watch Now"
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <LoadingIcons.Oval
                        style={{
                          fontSize: 12,
                          width: 20,
                          height: 20,
                          marginRight: 5,
                        }}
                      />
                      Fetching Torrents
                    </div>
                  )}
                </div>
                <button
                  className="genres__item"
                  onClick={() => {
                    if (isPresentInLibrary) {
                      removeFromLibrary();
                      setIsPresentInLibrary(false);
                    } else {
                      addToLibrary();
                      setIsPresentInLibrary(true);
                    }
                  }}
                  style={{ marginLeft: 20 }}
                >
                  {isPresentInLibrary
                    ? "Remove from Library"
                    : "Add to Library"}
                </button>
                <button
                  className="genres__item"
                  onClick={() => success()}
                  style={{ marginLeft: 20 }}
                >
                  Download
                </button>
              </div>
              <div className="cast">
                <div className="section__header">
                  <h2>Casts</h2>
                </div>
                <CastList id={item.id} />
              </div>
            </div>
          </div>
          <div className="container">
            <div className="section mb-3">
              <VideoList id={item.id} />
            </div>
            <div className="section mb-3">
              <div className="section__header mb-2">
                <h2>Similar</h2>
              </div>
              <MovieList category={category} type="similar" id={item.id} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

const SNavLink = styled(NavLink)``;

export default Details;
