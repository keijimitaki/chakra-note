import * as React from "react";
import { Box, Center, Image, Flex, Text, Button, AspectRatio, Badge } from "@chakra-ui/react";
import NextLink from "next/link"
import styles from './Article.module.scss';
import Fav from './Fav';


type Props = {
  key: string,
  id: string,
  title: string|null,
  author: string,
  content: string,
  orgUrl: string,
  favCount: number,
  favedUid: string|null,
  premiumFlag: string|null,
  tags: [],
}

const Article = (props: Props) => {

  console.log("props=>",props);

  return (
    <div>
      <Center h="10%" className={styles['article']}>
        {/* <Box p="1" minW="560px" maxH="560px" borderWidth="1px"> */}
        <Box p="1" maxW="560px" maxH="560px" borderWidth="1px">

          {(props.premiumFlag) && (props.premiumFlag === "1") && 
            <Badge className={styles['premiumLabel']} colorScheme='red' ml='3'>有料会員限定</Badge>
          }
          
          <AspectRatio maxW='560px' maxH='400px' ratio={4 / 3}>
            <NextLink href={'article/' + props.id}>
              <Image borderRadius="md" src={props.orgUrl} objectFit='cover' 
              className={styles['eyecatch']}/>
            </NextLink>
          </AspectRatio>

          <Text mt={2} paddingLeft={21} fontSize="xl" fontWeight="semibold" lineHeight="short">
            {props.content}
          </Text>
          <Flex mt={2} paddingLeft={4} align="center">
            <Fav articleId={props.id} favCount={props.favCount} favedUid={props.favedUid} />
            <Box className={styles['author']}>{props.author}</Box>
          </Flex>

          <Flex mb={2} paddingLeft={2} align="center">
            <Box minW="660px;">
              {(props.tags) && (props.tags.length>0) && props.tags.map((row: any) => (
                <Badge key={row.id} ml='3'>{row.tagName}</Badge>
              ))}
            </Box>
          </Flex>

        </Box>
      </Center>
    </div>
  );
}

export default Article;