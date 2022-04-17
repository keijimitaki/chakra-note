import React, { useState, useEffect, useContext } from "react";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Box, Center, Image, Flex, Badge, Text, Button, AspectRatio, Spacer } from "@chakra-ui/react";

import { useRouter } from 'next/router';

import '../utils/firebase' // Initialize FirebaseApp


const ImageUpLoad = (props:any) => {

  console.log('props:',props.defaultValue);
  let imageUrlDefault = props.defaultValue;

  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] = useState(props.defaultValue);
  useEffect(() => {
    setImageUrl(props.defaultValue);
  }, [props.defaultValue]);


  const [error, setError] = useState("");
  const [progress, setProgress] = useState(100);


  console.log('imageUrl:',imageUrl);

  const handleImage = (event:any) => {
    const image = event.target.files[0];
    //setImage(image);
    // 親に設定
    props.changeImage(image);

    const imageUrl = URL.createObjectURL(image);
    setImageUrl(imageUrl);

    setError("");

    // contextに設定
    // ctx.image(image);  
  };

  const onSubmit = (event:any) => {
    event.preventDefault();
    setError("");
    if (image === "") {
      console.log("ファイルが選択されていません");
      setError("ファイルが選択されていません");
      return;
    }
    // const sRef = storageRef(storage, "images/test/"); //どのフォルダの配下に入れるかを設定
  // 画像アップロード関数
  console.log("start");
    // アップロード処理
    console.log("アップロード処理");
    // 参照を作成 → 'images/(画像名)'
    const storage = getStorage();
    // @ts-ignore
    console.log(image.name);
    // @ts-ignore
    const imageRef  = ref(storage, `/images/${image.name}`);
    console.log(imageRef.name);
    console.log("uploadBytes",imageRef);
    // @ts-ignore
    uploadBytes(imageRef , image)
        .then((snapshot) => {
          console.log("アップロードに成功しました");
        // @ts-ignore
        //setImageUrl(`gs://chakura-note.appspot.com/images/${image.name}`);

        // Get the download URL
        getDownloadURL(imageRef)
          .then((url) => {
            // Insert url into an <img> tag to "download"
            setImageUrl(url);
          })
          .catch((error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/object-not-found':
                // File doesn't exist
                break;
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
              case 'storage/canceled':
                // User canceled the upload
                break;

              // ...

              case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break;
            }
          });        
        })

        .catch((error) => {
          console.log("アップロードに失敗しました");
        });
    }

  console.log("end");

  return (
    <>
    <div >
      {error && <div>{error}</div>}
      <form onSubmit={onSubmit}>
        <input type="file" onChange={handleImage} />
        
        {/* 

        <button onClick={onSubmit}>Upload</button> 
        
        */}

      </form>
      {/* {progress !== 100 && <LinearProgressWithLabel value={progress} />} */}
      { imageUrl && (
        <div>
          <img width="400px" src={imageUrl} alt="uploaded" />
        </div>
      )}
    </div>
    </>

  );
};


export default ImageUpLoad;
