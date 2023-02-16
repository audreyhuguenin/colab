/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent, entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import {
  Ancestor,
  useAncestors,
  useAndLoadSubCards,
  useCard,
  useCardContent,
  useProjectRootCard,
  useVariantsOrLoad,
} from '../../../selectors/cardSelector';
import { selectCurrentProject } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Admin from '../../admin/Admin';
import CardCreator from '../../cards/CardCreator';
import CardEditor from '../../cards/CardEditor';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import ContentSubs from '../../cards/ContentSubs';
import Checkbox from '../../common/element/Checkbox';
import IconButton from '../../common/element/IconButton';
import { IllustrationIconDisplay } from '../../common/element/IllustrationDisplay';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import { MainMenuLink } from '../../common/element/Link';
import Tips, { TipsCtx } from '../../common/element/Tips';
import Clickable from '../../common/layout/Clickable';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import Modal from '../../common/layout/Modal';
import Monkeys from '../../debugger/monkey/Monkeys';
import { UserDropDown } from '../../MainNav';
import Settings from '../../settings/Settings';
import {
  activeIconButtonStyle,
  iconButtonStyle,
  linkStyle,
  p_md,
  space_2xs,
  space_sm,
} from '../../styling/style';
import DocumentationTab from '../DocumentationTab';
import { PresenceContext, usePresenceContext } from '../presence/PresenceContext';
import { defaultProjectIllustration } from '../ProjectCommon';
import { ProjectSettingsTabs } from '../settings/ProjectSettingsTabs';
import Team from '../team/Team';
import ActivityFlowChart from './activityFlow/ActivityFlowChart';
import Hierarchy from './hierarchy/Hierarchy';

export const depthMax = 2;
const modelPictoCornerStyle = css({
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '5px 7px 7px 5px',
  borderRadius: '0 0 10px 0',
});

const breadCrumbsStyle = css({
  fontSize: '.8em',
  color: 'var(--secondary-main)',
  margin: '0 ' + space_sm,
  alignSelf: 'center',
});

const Ancestor = ({ card, content, last, className }: Ancestor): JSX.Element => {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

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
            navigate(`../${location.pathname.includes('hierarchy') ? 'hierarchy' : ''}`);
          }}
          className={cx(linkStyle, breadCrumbsStyle, className)}
        >
          {i18n.common.project}
        </Clickable>
        <Icon icon={'chevron_right'} opsz="xs" className={cx(breadCrumbsStyle, className)} />
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    //const match = location.pathname.match(/(edit|card)\/\d+\/v\/\d+/);
    //const t = match ? match[1] || 'card' : 'card';
    const t = 'card';

    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${t}/${content.cardId}/v/${content.id}`);
          }}
          className={cx(linkStyle, breadCrumbsStyle, className)}
        >
          {card.title ? card.title : i18n.modules.card.untitled}
        </Clickable>
        {!last && (
          <Icon icon={'chevron_right'} opsz="xs" className={cx(breadCrumbsStyle, className)} />
        )}
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
    return variants[0]!;
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
  touchMode: 'zoom' | 'edit';
  grow?: number;
  align?: 'center' | 'normal';
}

const CardWrapper = ({
  children,
  grow = 1,
  align = 'normal',
  touchMode,
}: CardWrapperProps): JSX.Element => {
  const { id, vId } = useParams<'id' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();

  const card = useCard(cardId);
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project: currentProject } = useAppSelector(selectCurrentProject);

  const ancestors = useAncestors(parentId);

  const { touch } = React.useContext(PresenceContext);

  React.useEffect(() => {
    touch({
      cardId: cardId,
      cardContentId: cardContentId,
      context: touchMode,
    });
  }, [touch, cardContentId, cardId, touchMode]);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (
    card == null ||
    card === 'LOADING' ||
    currentProject == null ||
    content == null ||
    content === 'LOADING'
  ) {
    return <InlineLoading />;
  } else {
    return (
      <>
          <Flex align="center">
            {ancestors.map((ancestor, x) => (
              <Ancestor
                key={x}
                card={ancestor.card}
                content={ancestor.content}
                className={cx({
                  [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
                })}
              />
            ))}
            <Ancestor
              card={card}
              content={content}
              last
              className={cx({
                [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
              })}
            />
          </Flex>
          {/* <IconButton
            title="toggle view edit"
            icon={location.pathname.includes('card') ? 'edit' : 'view_comfy'}
            onClick={() => {
              // Note : functional but not so strong
              if (location.pathname.includes('/card/')) {
                navigate(`${location.pathname.replace('/card/', '/edit/')}`);
              } else {
                navigate(`${location.pathname.replace('/edit/', '/card/')}`);
              }
            }}
            className={lightIconButtonStyle}
          /> */}
        <Flex
          direction="column"
          grow={grow}
          align={align}
          className={cx(p_md, css({ alignItems: 'stretch', overflow: 'auto' }))}
        >
          {children(card, content)}
        </Flex>
      </>
    );
  }
};

const CardEditWrapper = ({
  children,
  grow = 1,
  align = 'normal',
  touchMode,
}: CardWrapperProps): JSX.Element => {
  const { id, vId } = useParams<'id' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const card = useCard(cardId);
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project: currentProject } = useAppSelector(selectCurrentProject);

  const ancestors = useAncestors(parentId);

  const { touch } = React.useContext(PresenceContext);

  React.useEffect(() => {
    touch({
      cardId: cardId,
      cardContentId: cardContentId,
      context: touchMode,
    });
  }, [touch, cardContentId, cardId, touchMode]);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (
    card == null ||
    card === 'LOADING' ||
    currentProject == null ||
    content == null ||
    content === 'LOADING'
  ) {
    return <InlineLoading />;
  } else {
    return (
      <>
        <Modal
          title={
            <Flex align="center">
              {ancestors.map((ancestor, x) => (
                <Ancestor
                  key={x}
                  card={ancestor.card}
                  content={ancestor.content}
                  className={cx({
                    [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
                  })}
                />
              ))}
              <Ancestor
                card={card}
                content={content}
                last
                className={cx({
                  [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
                })}
              />
            </Flex>
          }
          size="full"
          onClose={() => {
            // to test when connectiing directly to a card
            navigate(-1);
          }}
          showCloseButton
        >
          {() => (
            <>
              {/* <Flex align="center" className={p_sm} justify="space-between">
                
                <IconButton
                  title="toggle view edit"
                  icon={location.pathname.includes('card') ? 'edit' : 'view_comfy'}
                  onClick={() => {
                    // Note : functional but not so strong
                    if (location.pathname.includes('/card/')) {
                      navigate(`${location.pathname.replace('/card/', '/edit/')}`);
                    } else {
                      navigate(`${location.pathname.replace('/edit/', '/card/')}`);
                    }
                  }}
                  className={lightIconButtonStyle}
                />
              </Flex> */}
              <Flex
                direction="column"
                grow={grow}
                align={align}
                className={css({ width: '100%', alignItems: 'stretch', overflow: 'auto' })}
              >
                {children(card, content)}
              </Flex>
            </>
          )}
        </Modal>
      </>
    );
  }
};

interface EditorNavProps {
  project: Project;
}

function EditorNav({ project }: EditorNavProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const tipsConfig = React.useContext(TipsCtx);

  return (
    <>
      <div
        className={cx(
          css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `${space_2xs} 0`,
          }),
        )}
      >
        <Flex align="center">
          <MainMenuLink to={`/`}>
            <span
              title={i18n.common.action.backToProjects}
              onClickCapture={() => {
                dispatch(API.closeCurrentProject());
              }}
            >
              <Icon icon={'home'} />
            </span>
          </MainMenuLink>
          <Flex
            className={css({
              alignItems: 'center',
              border: '1px solid var(--divider-main)',
            })}
            wrap="nowrap"
          >
            <MainMenuLink
              end
              to={`/editor/${project.id}`}
              className={active =>
                active.isActive || location.pathname.match(/^\/editor\/\d+\/(edit|card)/)
                  ? activeIconButtonStyle
                  : iconButtonStyle
              }
            >
              <Icon
                icon={'dashboard'}
                title={i18n.common.views.view + ' ' + i18n.common.views.board}
              />
            </MainMenuLink>
            {/* <MainMenuLink to="./hierarchy">
              <Icon
                icon={'family_history'}
                title={i18n.common.views.view + ' ' + i18n.common.views.hierarchy}
              />
            </MainMenuLink> */}
            <MainMenuLink to="./flow">
              <Icon
                icon={'account_tree'}
                title={i18n.common.views.view + ' ' + i18n.common.views.activityFlow}
              />
            </MainMenuLink>
          </Flex>
        </Flex>
        <div
          className={css({
            gridColumn: '2/3',
            placeSelf: 'center',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <Flex className={cx(css({ textTransform: 'initial', margin: `0 ${space_sm}` }))}>
            <Flex align="center">
              <Flex
                className={css({
                  backgroundColor: project.illustration?.iconBkgdColor,
                  padding: '3px 5px',
                  borderRadius: '3px',
                })}
              >
                <IllustrationIconDisplay
                  illustration={
                    project.illustration ? project.illustration : defaultProjectIllustration
                  }
                  iconColor="#fff"
                />
              </Flex>
              <DiscreetInput
                value={project.name || i18n.modules.project.actions.newProject}
                placeholder={i18n.modules.project.actions.newProject}
                onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
              />
            </Flex>
          </Flex>
        </div>
        <Flex align="center" justify="flex-end">
          {/* <Presence projectId={project.id!} /> */}
          <Monkeys />
          <Tips tipsType="FEATURE_PREVIEW">
            <Flex>
              <Checkbox
                label={i18n.tips.label.feature_preview}
                value={tipsConfig.FEATURE_PREVIEW.value}
                onChange={tipsConfig.FEATURE_PREVIEW.set}
                className={css({ display: 'inline-block', marginRight: space_sm })}
              />
            </Flex>
          </Tips>
          <MainMenuLink to="./docs">
            <Icon icon={'menu_book'} title={i18n.modules.project.settings.resources.label} />
          </MainMenuLink>
          <MainMenuLink
            to="./team"
            className={active =>
              active.isActive || location.pathname.match(/^\/editor\/\d+\/team/)
                ? activeIconButtonStyle
                : iconButtonStyle
            }
          >
            <Icon icon={'group'} title={i18n.team.teamManagement} />
          </MainMenuLink>
          <MainMenuLink to="./project-settings">
            <Icon title={i18n.modules.project.labels.projectSettings} icon={'settings'} />
          </MainMenuLink>
          <UserDropDown />
        </Flex>
      </div>
    </>
  );
}

function RootView({ rootContent }: { rootContent: CardContent | null | undefined }) {
  const { touch } = React.useContext(PresenceContext);
  const [organize, setOrganize] = React.useState(false);

  React.useEffect(() => {
    touch({});
  }, [touch]);

  return (
    <div
      className={css({
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
        height: '100%',
      })}
    >
      {rootContent != null ? (
        <Flex className={css({overflow: 'hidden'})}>
          <CardCreatorAndOrganize
            rootContent={rootContent}
            organize={{ organize: organize, setOrganize: setOrganize }}
          />
          <ContentSubs
            minCardWidth={150}
            showEmptiness={true}
            depth={depthMax}
            cardContent={rootContent}
            organize={organize}
            className={css({height: '100%', overflow: 'auto'})}
          />
        </Flex>
      ) : (
        <InlineLoading />
      )}
    </div>
  );
}

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project, status } = useAppSelector(selectCurrentProject);

  const root = useProjectRootCard(project?.id);

  const presenceContext = usePresenceContext();

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
    if (window && window.top && window.top.document) {
      if (project) {
        if (project.name) {
          window.top.document.title = 'co.LAB - ' + project?.name;
        }
      } else {
        window.top.document.title = 'co.LAB';
      }
    }
  }, [project, project?.name]);

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
        <i>{i18n.modules.project.info.noProjectSelected}</i>
      </div>
    );
  } else if (status != 'READY' || typeof root === 'string' || root.id == null) {
    return <InlineLoading />;
  } else {
    return (
      <PresenceContext.Provider value={presenceContext}>
        <Flex direction="column" align="stretch" grow={1} className={css({height: '100vh'})}>
          <EditorNav project={project} />
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({
              overflow: 'auto',
              position: 'relative',
            })}
          >
            {project.type === 'MODEL' && (
              <Flex
                align="center"
                justify="center"
                className={modelPictoCornerStyle}
                title={i18n.modules.project.info.isAModel}
              >
                {project.globalProject ? (
                  <Icon icon={'public'} color="white" opsz="sm" />
                ) : (
                  <Icon icon={'star'} color="white" opsz="sm" />
                )}
              </Flex>
            )}

            <Routes>
              <Route path="settings/*" element={<Settings />} />
              <Route
                path="project-settings/*"
                element={<ProjectSettingsTabs projectId={project.id} />}
              />
              <Route path="admin/*" element={<Admin />} />
              <Route path="team/*" element={<Team project={project} />} />
              <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
              <Route path="flow" element={<ActivityFlowChart />} />
              <Route path="docs/*" element={<DocumentationTab project={project} />} />
              <Route path="card/:id" element={<DefaultVariantDetector />} />
              {/* Zooom on a card */}
              <Route
                path="card/:id/v/:vId/*"
                element={
                  <CardWrapper grow={1} touchMode="zoom">
                    {card => <CardThumbWithSelector depth={2} card={card} mayOrganize />}
                  </CardWrapper>
                }
              />
              {/* Edit cart, send to default variant */}
              <Route path="edit/:id" element={<DefaultVariantDetector />} />

              {/* Edit card */}
              <Route
                path={`/edit/:id/v/:vId/*`}
                element={
                  <CardEditWrapper touchMode="edit">
                    {(card, variant) => <CardEditor card={card} variant={variant} />}
                  </CardEditWrapper>
                }
              />
              <Route
                path="hierarchy/card/:id/v/:vId/*"
                element={
                  <CardWrapper grow={1} touchMode="zoom">
                    {card => <CardThumbWithSelector depth={2} card={card} mayOrganize />}
                  </CardWrapper>
                }
              />
              <Route path="hierarchy/edit/:id" element={<DefaultVariantDetector />} />
              <Route
                path="hierarchy/edit/:id/v/:vId/*"
                element={
                  <CardEditWrapper touchMode="edit">
                    {(card, variant) => <CardEditor card={card} variant={variant} />}
                  </CardEditWrapper>
                }
              />
              {/* All cards. Root route */}
              <Route path="*" element={<RootView rootContent={rootContent} />} />
            </Routes>
          </Flex>
        </Flex>
      </PresenceContext.Provider>
    );
  }
}
interface CardCreatorAndOrganizeProps {
  rootContent: CardContent;
  organize: {
    organize: boolean;
    setOrganize: React.Dispatch<React.SetStateAction<boolean>>;
  };
}
function CardCreatorAndOrganize({ rootContent, organize }: CardCreatorAndOrganizeProps) {
  const i18n = useTranslations();
  const subCards = useAndLoadSubCards(rootContent.id);
  return (
    <>
      {subCards && subCards.length > 0 && (
        <Flex direction="column" gap={space_sm} align="center">
          <IconButton
            className={cx(
              css({ alignSelf: 'flex-end' }),
              organize.organize &&
                css({
                  backgroundColor: 'var(--success-main)',
                  color: 'var(--bg-primary)',
                }),
            )}
            title={i18n.modules.card.positioning.toggleText}
            icon={'view_quilt'}
            onClick={() => organize.setOrganize(e => !e)}
          />
          <CardCreator parentCardContent={rootContent} />
        </Flex>
      )}
    </>
  );
}
