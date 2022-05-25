/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faBoxesStacked,
  faChevronRight,
  faClone,
  faCog,
  faEllipsisV,
  faEye,
  faInfoCircle,
  faNetworkWired,
  faProjectDiagram,
  faTimes,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../../API/api';
import { sortCardContents } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import {
  Ancestor,
  useAncestors,
  useCard,
  useCardContent,
  useProjectRootCard,
  useVariantsOrLoad,
} from '../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CardEditor from '../../cards/CardEditor';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import ProjectCardTypeList from '../../cards/cardtypes/ProjectCardTypeList';
import ContentSubs from '../../cards/ContentSubs';
import Clickable from '../../common/Clickable';
import DropDownMenu from '../../common/DropDownMenu';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import {
  fullPageStyle,
  invertedThemeMode,
  linkStyle,
  space_L,
  space_M,
  space_S,
} from '../../styling/style';
import { ProjectSettings } from '../ProjectSettings';
import Team from '../Team';
import ActivityFlowChart from './ActivityFlowChart';
import Hierarchy from './Hierarchy';

export const depthMax = 2;
const descriptionStyle = {
  backgroundColor: 'var(--fgColor)',
  color: 'var(--bgColor)',
  gap: space_L,
  transition: 'all 1s ease',
  overflow: 'hidden',
  fontSize: '0.9em',
  flexGrow: 0,
};
const openDetails = css({
  ...descriptionStyle,
  maxHeight: '300px',
  padding: space_L,
});
const closeDetails = css({
  ...descriptionStyle,
  maxHeight: '0px',
  padding: '0 ' + space_L,
});

const breadCrumbsStyle = css({
  fontSize: '.8em',
  color: 'var(--darkGray)',
  margin: '0 ' + space_S,
  alignSelf: 'center',
});
const Ancestor = ({ card, content }: Ancestor): JSX.Element => {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (typeof card === 'number') {
      dispatch(API.getCard(card));
    }

    if (typeof content === 'number') {
      dispatch(API.getCardContent(content));
    }
  }, [card, content, dispatch]);

  if (entityIs(card, 'Card') && card.rootCardProjectId != null) {
    return (
      <>
        <Clickable
          onClick={() => {
            navigate('..');
          }}
          clickableClassName={cx(linkStyle, breadCrumbsStyle)}
        >
          project
        </Clickable>
        <FontAwesomeIcon icon={faChevronRight} size="xs" className={breadCrumbsStyle} />
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    const match = location.pathname.match(/(edit|card)\/\d+\/v\/\d+/);
    const t = match ? match[1] || 'card' : 'card';

    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${t}/${content.cardId}/v/${content.id}`);
          }}
          clickableClassName={cx(linkStyle, breadCrumbsStyle)}
        >
          {card.title ? card.title : i18n.card.untitled + ' ' + content.title ? content.title : ''}
        </Clickable>
        <FontAwesomeIcon icon={faChevronRight} size="xs" className={breadCrumbsStyle} />
      </>
    );
  } else {
    return <InlineLoading />;
  }
};

/**
 * use default cardContent
 */
export function useDefaultVariant(cardId: number): 'LOADING' | CardContent {
  const dispatch = useAppDispatch();
  const card = useCard(cardId);

  const variants = useVariantsOrLoad(card !== 'LOADING' ? card : undefined);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (card === 'LOADING' || card == null || variants == null) {
    return 'LOADING';
  } else if (variants.length === 0) {
    return 'LOADING';
  } else {
    return sortCardContents(variants)[0]!;
  }
}

/**
 * Fetch card id from route and redirect to default variant
 */
const DefaultVariantDetector = (): JSX.Element => {
  const { id } = useParams<'id'>();
  const cardId = +id!;

  const variant = useDefaultVariant(cardId);

  if (entityIs(variant, 'CardContent')) {
    return <Navigate to={`v/${variant.id}`} />;
  } else {
    return <InlineLoading />;
  }
};

interface CardWrapperProps {
  children: (card: Card, variant: CardContent) => JSX.Element;
  grow?: number;
  align?: 'center' | 'normal';
}

const CardWrapper = ({ children, grow = 1, align = 'normal' }: CardWrapperProps): JSX.Element => {
  const { id, vId } = useParams<'id' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();

  const card = useCard(cardId);
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project } = useProjectBeingEdited();

  const ancestors = useAncestors(parentId);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (
    card == null ||
    card === 'LOADING' ||
    project == null ||
    content == null ||
    content === 'LOADING'
  ) {
    return <InlineLoading />;
  } else {
    return (
      <>
        <Flex className={css({ paddingBottom: space_M })}>
          <IconButton
            icon={faArrowLeft}
            title={'Back to project root'}
            iconColor="var(--darkGray)"
            onClick={() => navigate('../')}
            className={css({ marginRight: space_M })}
          />
          {ancestors.map((ancestor, x) => (
            <Ancestor key={x} card={ancestor.card} content={ancestor.content} />
          ))}
        </Flex>
        <Flex direction="column" grow={grow} align={align} className={css({ width: '100%' })}>
          {children(card, content)}
        </Flex>
      </>
    );
  }
};

interface EditorNavProps {
  projectName: string;
  setShowProjectDetails: (value: React.SetStateAction<boolean>) => void;
}

function EditorNav({ projectName, setShowProjectDetails }: EditorNavProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return (
    <>
      <div
        className={cx(
          invertedThemeMode,
          css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `${space_S} ${space_M}`,
            backgroundColor: 'var(--hoverBgColor)',
          }),
        )}
      >
        <IconButton
          icon={faArrowLeft}
          title="Back to projects"
          onClick={events => {
            events.preventDefault();
            navigate('../../');
            dispatch(API.closeCurrentProject());
          }}
        />
        <div className={css({ gridColumn: '2/3', placeSelf: 'center', display: 'flex' })}>
          <IconButton
            icon={faInfoCircle}
            title="Show project details"
            onClick={() => setShowProjectDetails(showProjectDetails => !showProjectDetails)}
          />
          <div className={css({ marginRight: space_M })}>{projectName}</div>
          <DropDownMenu
            icon={faEye}
            valueComp={{ value: '', label: '' }}
            entries={[
              {
                value: 'board',
                label: (
                  <>
                    <FontAwesomeIcon icon={faClone} /> Board
                  </>
                ),
                action: () => navigate('./'),
              },
              {
                value: 'hierarchy',
                label: (
                  <>
                    <FontAwesomeIcon icon={faNetworkWired} /> Hierarchy
                  </>
                ),
                action: () => navigate('./hierarchy'),
              },
              {
                value: 'flow',
                label: (
                  <>
                    <FontAwesomeIcon icon={faProjectDiagram} /> Activity Flow
                  </>
                ),
                action: () => navigate('./flow'),
              },
            ]}
            buttonClassName={css({ textAlign: 'right', alignSelf: 'center', marginLeft: 'auto' })}
            menuIcon="CARET"
          />
        </div>
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          entries={[
            {
              value: 'types',
              label: (
                <>
                  <FontAwesomeIcon icon={faBoxesStacked} /> Card types
                </>
              ),
              action: () => navigate('./types'),
            },
            {
              value: 'team',
              label: (
                <>
                  <FontAwesomeIcon icon={faUsers} /> Team
                </>
              ),
              action: () => navigate('./team'),
            },
            {
              value: 'settings',
              label: (
                <>
                  <FontAwesomeIcon icon={faCog} /> Settings
                </>
              ),
              action: () => navigate('./settings'),
            },
          ]}
          buttonClassName={css({ textAlign: 'right', alignSelf: 'center', marginLeft: 'auto' })}
        />
      </div>
    </>
  );
}

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project, status } = useProjectBeingEdited();

  const root = useProjectRootCard(project);
  const [showProjectDetails, setShowProjectDetails] = React.useState(false);

  const rootContent = useAppSelector(state => {
    if (entityIs(root, 'Card') && root.id != null) {
      const card = state.cards.cards[root.id];
      if (card != null) {
        if (card.contents === undefined) {
          return undefined;
        } else if (card.contents === null) {
          return null;
        } else {
          const contents = Object.values(card.contents);
          if (contents.length === 0) {
            return null;
          } else {
            return state.cards.contents[contents[0]!]!.content;
          }
        }
      }
    }
  });

  React.useEffect(() => {
    if (entityIs(root, 'Card') && root.id != null && rootContent === undefined) {
      dispatch(API.getCardContents(root.id));
    }
  }, [dispatch, root, rootContent]);

  if (status == 'LOADING') {
    return <InlineLoading />;
  } else if (project == null || project.id == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else if (status != 'READY' || typeof root === 'string' || root.id == null) {
    return <InlineLoading />;
  } else {
    return (
      <Flex direction="column" align="stretch" grow={1} className={fullPageStyle}>
        <EditorNav
          projectName={project.name || 'New project'}
          setShowProjectDetails={setShowProjectDetails}
        />
        <Flex className={showProjectDetails ? openDetails : closeDetails} justify="space-between">
          <div>
            <div>
              <h3>{project.name}</h3>
              {project.description}
            </div>
            <div>
              <p>Created by: {project.trackingData?.createdBy}</p>
              <p>Created date: {i18n.common.datetime(project.trackingData?.creationDate)}</p>
              {/* more infos? Add project team names */}
            </div>
          </div>
          <IconButton icon={faTimes} title="Close" onClick={() => setShowProjectDetails(false)} />
        </Flex>
        <Flex
          direction="column"
          grow={1}
          align="stretch"
          className={css({
            padding: space_L,
            overflow: 'auto',
          })}
        >
          <Flex direction="column" grow={1}>
            <Routes>
              <Route path="settings" element={<ProjectSettings project={project} />} />
              <Route path="team" element={<Team project={project} />} />
              <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
              <Route path="flow" element={<ActivityFlowChart />} />
              <Route path="types/*" element={<ProjectCardTypeList />} />
              <Route path="card/:id" element={<DefaultVariantDetector />} />
              {/* Zooom on a card */}
              <Route
                path="card/:id/v/:vId/*"
                element={
                  <CardWrapper grow={0} align="center">
                    {card => <CardThumbWithSelector depth={2} card={card} />}
                  </CardWrapper>
                }
              />
              {/* Edit cart, send to default variant */}
              <Route path="edit/:id" element={<DefaultVariantDetector />} />
              {/* Edit card */}
              <Route
                path="edit/:id/v/:vId/*"
                element={
                  <CardWrapper>
                    {(card, variant) => <CardEditor card={card} variant={variant} showSubcards />}
                  </CardWrapper>
                }
              />
              {/* All cards. Root route */}
              <Route
                path="*"
                element={
                  <div>
                    {rootContent != null ? (
                      <ContentSubs
                        showEmptiness={true}
                        depth={depthMax}
                        cardContent={rootContent}
                      />
                    ) : (
                      <InlineLoading />
                    )}
                  </div>
                }
              />
            </Routes>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
