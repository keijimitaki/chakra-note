import { memo, useEffect, useRef } from "react";


type Props = {
  onIntersect: ()=>{},
  isActiveObserver: boolean,
}

const ScrollObserver = memo((props:Props) => {
  const { onIntersect, isActiveObserver } = props;
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].intersectionRatio >= 1) {
          observer.disconnect();
          onIntersect();
        }
      },
      {
        threshold: 1,
      }
    );
    //@ts-ignore
    observer.observe(ref.current);
  }, [onIntersect]);

  return (
    <>
      {isActiveObserver ? (
        <div ref={ref} style={{ height: "10px", backgroundColor: "gray" }}>
          <p>読み込み中...</p>
        </div>
      ) : null}
    </>
  );
});

export default ScrollObserver;