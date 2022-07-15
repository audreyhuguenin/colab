/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faCog,
  faEllipsisV,
  faInfoCircle,
  faPaperclip,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Creatable from 'react-select/creatable';
import * as API from '../../../API/api';
import { updateDocumentText } from '../../../API/api';
import {
  useAndLoadCardType,
  useCurrentProjectCardTypeTags,
  useGlobalCardTypeTags,
} from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { dispatch } from '../../../store/store';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { InlineInput } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import Toggler from '../../common/Form/Toggler';
import ConfirmDeleteModal from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Modal from '../../common/layout/Modal';
import { DocTextWrapper } from '../../documents/DocTextItem';
import ResourcesWrapper from '../../resources/ResourcesWrapper';
import {
  cardStyle,
  errorColor,
  lightIconButtonStyle,
  lightItalicText,
  localTitleStyle,
  space_M,
  space_S,
} from '../../styling/style';
import SideCollapsiblePanel from './../SideCollapsiblePanel';

interface CardTypeEditorProps {
  className?: string;
  usage: 'currentProject' | 'global';
}

export default function CardTypeEditor({ className, usage }: CardTypeEditorProps): JSX.Element {
  const navigate = useNavigate();

  const id = useParams<'id'>();
  const typeId = +id.id!;

  const { cardType, status } = useAndLoadCardType(typeId);
  const { project } = useProjectBeingEdited();

  const allCurrentProjectTags = useCurrentProjectCardTypeTags();
  const allGlobalTags = useGlobalCardTypeTags();
  const options = (usage === 'currentProject' ? allCurrentProjectTags : allGlobalTags).map(tag => ({
    label: tag,
    value: tag,
  }));

  if (status !== 'READY' || !cardType) {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return (
      <Flex
        direction="column"
        grow={1}
        align="stretch"
        className={cx(css({ alignSelf: 'stretch' }), className)}
      >
        <IconButton
          icon={faArrowLeft}
          title={'Back to card types'}
          iconColor="var(--darkGray)"
          onClick={() => navigate('../')}
          className={css({ display: 'block', marginBottom: space_M })}
        />
        <Flex
          grow={1}
          direction="row"
          justify="space-between"
          align="stretch"
          className={cx(
            cardStyle,
            css({
              backgroundColor: 'white',
            }),
          )}
        >
          <Flex
            direction="column"
            grow={1}
            className={css({
              padding: '10px',
              overflow: 'auto',
            })}
            align="stretch"
          >
            <Flex
              justify="space-between"
              className={css({
                paddingBottom: space_S,
                borderBottom: '1px solid var(--lightGray)',
              })}
            >
              <InlineInput
                value={cardType.title || ''}
                placeholder="card type"
                autoWidth
                saveMode="ON_CONFIRM"
                onChange={newValue =>
                  dispatch(API.updateCardTypeTitle({ ...cardType, title: newValue }))
                }
                inputDisplayClassName={localTitleStyle}
              />
              <Flex>
                {/* handle modal routes*/}
                <Routes>
                  <Route
                    path="settings"
                    element={
                      <Modal
                        title="Advanced type settings"
                        onClose={() => navigate('./')}
                        showCloseButton
                      >
                        {() => (
                          <>
                            <Toggler
                              value={cardType.deprecated || undefined}
                              label="deprecated"
                              onChange={() =>
                                dispatch(
                                  API.updateCardTypeDeprecated({
                                    ...cardType,
                                    deprecated: !cardType.deprecated,
                                  }),
                                )
                              }
                            />
                            <div className={lightItalicText}>
                              <FontAwesomeIcon icon={faInfoCircle} /> Make a Card type
                              <b> deprecated</b> whether it is obsolete or another version should be
                              used instead.
                            </div>
                          </>
                        )}
                      </Modal>
                    }
                  />
                </Routes>
                <DropDownMenu
                  icon={faEllipsisV}
                  valueComp={{ value: '', label: '' }}
                  buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
                  entries={[
                    {
                      value: 'settings',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faCog} /> Type Settings
                        </>
                      ),
                      action: () => navigate('settings'),
                    },
                    {
                      value: 'Delete type',
                      label: (
                        <ConfirmDeleteModal
                          buttonLabel={
                            <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                              <FontAwesomeIcon icon={faTrash} /> Delete type
                            </div>
                          }
                          className={css({
                            '&:hover': { textDecoration: 'none' },
                            display: 'flex',
                            alignItems: 'center',
                          })}
                          message={
                            <p>
                              <Tips tipsType="TODO">
                                Make test if type is used in card(s). Disable or hide this delete
                                option if used.
                              </Tips>
                              Are you <strong>sure</strong> you want to delete this card type?
                            </p>
                          }
                          onConfirm={() => {
                            if (project && cardType.kind === 'own') {
                              dispatch(API.deleteCardType(cardType));
                              navigate('../');
                            }
                          }}
                          confirmButtonLabel={'Delete card type'}
                        />
                      ),
                      modal: true,
                    },
                  ]}
                />
              </Flex>
            </Flex>
            <Flex direction="column" grow={1} align="stretch">
              <Flex className={css({ margin: space_M + ' 0' })} direction="column" align="stretch">
                <h3>Purpose: </h3>
                <DocTextWrapper id={cardType.purposeId}>
                  {text => (
                    <InlineInput
                      value={text || ''}
                      placeholder={'Explain the purpose'}
                      inputType="textarea"
                      saveMode="ON_CONFIRM"
                      onChange={(newValue: string) => {
                        if (cardType.purposeId) {
                          dispatch(
                            updateDocumentText({ id: cardType.purposeId, textData: newValue }),
                          );
                        }
                      }}
                      rows={8}
                      inputDisplayClassName={css({ minWidth: '100%' })}
                    />
                  )}
                </DocTextWrapper>
              </Flex>
              <Flex
                direction="column"
                align="stretch"
                className={css({
                  alignSelf: 'flex-start',
                  minWidth: '40%',
                  margin: space_S + ' 0',
                })}
              >
                <Creatable
                  isMulti={true}
                  value={cardType.tags.map(tag => ({ label: tag, value: tag }))}
                  options={options}
                  onChange={tagsOptions => {
                    dispatch(
                      API.updateCardTypeTags({
                        ...cardType,
                        tags: tagsOptions.map(o => o.value),
                      }),
                    );
                  }}
                />
              </Flex>
              <Flex>
                <Toggler
                  value={cardType.published || undefined}
                  label="published"
                  tip="Make a card type published if you want to access it in your other projects"
                  onChange={() =>
                    dispatch(
                      API.updateCardTypePublished({
                        ...cardType,
                        published: !cardType.published,
                      }),
                    )
                  }
                />
              </Flex>
            </Flex>
          </Flex>
          <SideCollapsiblePanel
            direction="RIGHT"
            items={{
              resources: {
                children: (
                  <>
                    {cardType.ownId && (
                      <ResourcesWrapper
                        kind={'CardType'}
                        //accessLevel={ userAcl.write ? 'WRITE' : userAcl.read ? 'READ' : 'DENIED'}
                        // TODO manage the user rights for editing resources
                        // TODO work in progress
                        accessLevel="WRITE"
                        cardTypeId={cardType.ownId}
                      />
                    )}
                  </>
                ),
                icon: faPaperclip,
                title: 'Documentation',
              },
            }}
            openKey={'resources'}
          />
        </Flex>
      </Flex>
    );
  }
}
