import * as React from "react";
import { Box, Center, Image, Flex, Badge, Text, Textarea, Button, AspectRatio, Spacer } from "@chakra-ui/react";
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
          
          {/* <Text mt={2} paddingLeft={21} fontSize="xl" fontWeight="semibold" lineHeight="short">
            {props.comment}

          </Text>
 */}
          <Textarea
              placeholder='Here is a sample placeholder'
              size='sm'
              id="comment"
              aria-label="minimum height"
              style={{ width: 500 }}
              isReadOnly={true}
              variant='unstyled'          >
              {props.comment}

          </Textarea>

                    
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