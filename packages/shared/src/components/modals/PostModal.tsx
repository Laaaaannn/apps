import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { ModalProps } from './StyledModal';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';
import { PostContent, SCROLL_OFFSET } from '../post/PostContent';
import styles from './PostModal.module.css';
import { PostNavigationProps } from '../post/PostNavigation';
import { PostData, POST_BY_ID_QUERY } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';

interface PostModalProps
  extends ModalProps,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
  id: string;
  isFetchingNextPage?: boolean;
}

export function PostModal({
  className,
  children,
  onRequestClose,
  id,
  isFetchingNextPage,
  onPreviousPost,
  onNextPost,
  ...props
}: PostModalProps): ReactElement {
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const { tokenRefreshed } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState<string>();
  const isExtension = !!process.env.TARGET_BROWSER;
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  const {
    data: postById,
    isLoading,
    isFetched,
  } = useQuery<PostData>(
    ['post', id],
    () => request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, { id }),
    { enabled: !!id && tokenRefreshed },
  );

  useEffect(() => {
    if (isExtension) {
      return;
    }

    if (!currentPage) {
      setCurrentPage(window.location.pathname);
    }

    window.history.replaceState({}, `Post: ${id}`, `/posts/${id}`);
  }, [id]);

  const onClose: typeof onRequestClose = (e) => {
    if (!isExtension && currentPage) {
      window.history.replaceState({}, `Feed`, currentPage);
      setCurrentPage(undefined);
    }
    onRequestClose(e);
  };

  useEffect(() => {
    const modal = document.getElementById('post-modal');

    if (!modal) {
      return;
    }

    const parent = modal.parentElement;

    const onScroll = (e) => {
      if (e.currentTarget.scrollTop > SCROLL_OFFSET) {
        if (position !== 'fixed') {
          setPosition('fixed');
        }
        return;
      }

      if (position !== 'relative') {
        setPosition('relative');
      }
    };

    parent.addEventListener('scroll', onScroll);

    // eslint-disable-next-line consistent-return
    return () => {
      parent.removeEventListener('scroll', onScroll);
    };
  }, [position]);

  useEffect(() => {
    if (isLoading) {
      const modal = document.getElementById('post-modal');

      if (!modal) {
        return;
      }

      const parent = modal.parentElement;

      parent?.scrollTo?.(0, 0);
      setPosition('relative');
    }
  }, [isLoading]);

  return (
    <Modal
      {...props}
      portalClassName={styles.postModal}
      className={classNames(className, 'post-modal focus:outline-none')}
      overlayClassName="post-modal-overlay"
      id="post-modal"
      onRequestClose={onClose}
    >
      <PostContent
        position={position}
        postById={postById}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        className="post-content"
        onClose={onClose}
        isLoading={isLoading || !isFetched || isFetchingNextPage}
        isModal
      />
    </Modal>
  );
}
