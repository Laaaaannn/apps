import React, {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useContext,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import MenuIcon from '../icons/Menu';
import CloseIcon from '../icons/Close';
import OpenLinkIcon from '../icons/OpenLink';
import { Roles } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { Post } from '../../graphql/posts';
import useReportPostMenu from '../../hooks/useReportPostMenu';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button } from '../buttons/Button';
import PostOptionsMenu from '../PostOptionsMenu';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';

export interface PostModalActionsProps {
  post: Post;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  origin?: PostOrigin;
  notificactionClassName?: string;
}

const Container = classed('div', 'flex flex-row items-center');

const BanPostModal = dynamic(() => import('../modals/BanPostModal'));

const DeletePostModal = dynamic(() => import('../modals/DeletePostModal'));

export function PostModalActions({
  post,
  onClose,
  inlineActions,
  className,
  origin = 'article page',
  notificactionClassName,
  ...props
}: PostModalActionsProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);
  const { showReportMenu } = useReportPostMenu();
  const [showBanPost, setShowBanPost] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);

  const showPostOptionsContext = (e) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  const onReadArticle = () => {
    trackEvent(
      postAnalyticsEvent('go to link', post, {
        extra: { origin },
      }),
    );
  };

  const isModerator = user?.roles?.indexOf(Roles.Moderator) > -1;

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <Button
        className={inlineActions ? 'btn-tertiary' : 'btn-secondary'}
        tag="a"
        href={post.permalink}
        target="_blank"
        icon={<OpenLinkIcon className="icon" />}
        onClick={onReadArticle}
      >
        {!inlineActions && 'Read article'}
      </Button>
      <SimpleTooltip placement="bottom" content="Options">
        <Button
          className={classNames('btn-tertiary', !inlineActions && 'ml-auto')}
          icon={<MenuIcon size="medium" />}
          onClick={(event) => showPostOptionsContext(event)}
        />
      </SimpleTooltip>
      {onClose && (
        <SimpleTooltip placement="bottom" content="Close">
          <Button
            className="btn-tertiary"
            icon={<CloseIcon />}
            onClick={(e) => onClose(e)}
          />
        </SimpleTooltip>
      )}
      <PostOptionsMenu
        post={post}
        setShowBanPost={isModerator ? () => setShowBanPost(true) : null}
        setShowDeletePost={isModerator ? () => setShowDeletePost(true) : null}
      />
      {showBanPost && (
        <BanPostModal
          postId={post.id}
          isOpen={showBanPost}
          onRequestClose={() => setShowBanPost(false)}
        />
      )}
      {showDeletePost && (
        <DeletePostModal
          postId={post.id}
          isOpen={showDeletePost}
          onRequestClose={() => setShowDeletePost(false)}
        />
      )}
    </Container>
  );
}
