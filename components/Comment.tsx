import * as React from "react";
import { Box, Center, Image, Flex, Badge, Text, Button, AspectRatio, Spacer } from "@chakra-ui/react";
import { useRouter } from 'next/router';

import styles from './Comment.module.scss';

type Props = {
  docId: string,
  articleId: string,
  commentedUid: string,
  comment: string,
  createdAt: string,
  deletable: boolean,
  delHandler: ()=>{},
}



const Comment = (props: Props) => {

  return (
    <div>
      <hr/>
      <Center h="120px">
          <Text mt={2} paddingLeft={21} fontSize="xl" fontWeight="semibold" lineHeight="short">
          <b>{props.comment}</b>

          </Text>
          <Flex mt={2} paddingLeft={21} align="center">
            <Text ml={1} fontSize="sm" align="center">
              <b>{props.createdAt}</b>
            </Text>

            { props.deletable && <Button onClick={props.delHandler}>削除</Button>
            }
          </Flex>

      </Center>
    </div>
  );
}

export default Comment;