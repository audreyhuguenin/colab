/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { AccessControl, Card, InvolvementLevel } from 'colab-rest-client';
import { mapValues, uniq } from 'lodash';
import * as React from 'react';
import * as API from '../API/api';
import logger from '../logger';
import {
  customColabStateEquals,
  shallowEqual,
  useAppDispatch,
  useAppSelector,
  useLoadDataWithArg,
} from '../store/hooks';
import { CardDetail } from '../store/slice/cardSlice';
import { AvailabilityStatus, ColabState } from '../store/store';
import { useAllProjectCardsSorted } from './cardSelector';
import { selectCurrentProjectId } from './projectSelector';
import { useCurrentTeamMemberId } from './teamMemberSelector';
import { useMyMember } from './teamSelector';
import { useCurrentUser } from './userSelector';

export type ACL = {
  members: Record<number, InvolvementLevel>;
  roles: Record<number, InvolvementLevel>;
};

export type CardAcl = {
  status: {
    cardId: number | null | undefined;
    missingCardId: number | undefined;
    missingCardContentId: number | undefined;
    missingAclCardId: number | undefined;
  };
  self: ACL;
  effective: {
    members: Record<number, InvolvementLevel[]>;
    roles: Record<number, InvolvementLevel>;
  };
};

const useCardACL = (cardId: number | null | undefined): CardAcl => {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  return useAppSelector(
    state => {
      const result: CardAcl = {
        status: {
          cardId: cardId,
          missingCardId: undefined,
          missingCardContentId: undefined,
          missingAclCardId: undefined,
        },
        self: {
          members: {},
          roles: {},
        },
        effective: {
          members: {},
          roles: {},
        },
      };

      if (currentProjectId != null) {
        const team = state.team.teams[currentProjectId];

        let nextCardId: number | null | undefined = cardId;
        while (nextCardId != null) {
          const cardDetail: CardDetail | undefined = state.cards.cards[nextCardId];
          const aclState = state.acl.acls[nextCardId];
          const currentCardId = nextCardId;

          result.status.missingCardId = cardDetail != undefined ? undefined : nextCardId;
          result.status.missingAclCardId =
            aclState == null || aclState.status === 'NOT_INITIALIZED' ? nextCardId : undefined;

          logger.debug('useACL status: ', result.status);

          nextCardId = undefined;

          if (team != null && team.status === 'READY') {
            if (cardDetail != null) {
              if (aclState != null && aclState.status === 'READY') {
                const cardAcl = Object.values(aclState.acl).reduce<ACL>(
                  (acc, cur) => {
                    if (cur.memberId != null) {
                      acc.members[cur.memberId] = cur.cairoLevel;
                    } else if (cur.roleId != null) {
                      acc.roles[cur.roleId] = cur.cairoLevel;
                    }
                    return acc;
                  },
                  { members: {}, roles: {} },
                );

                if (currentCardId === cardId) {
                  result.self = cardAcl;
                }

                result.effective.members = {
                  ...mapValues(cardAcl.members, item => {
                    return [item];
                  }),
                  ...result.effective.members,
                };

                result.effective.roles = { ...cardAcl.roles, ...result.effective.roles };

                for (const memberId in team.members) {
                  const memberStatus = result.effective.members[memberId];
                  if (memberStatus == null) {
                    const newStatus: InvolvementLevel[] = [];

                    const member = team.members[memberId];
                    if (member != null) {
                      member.roleIds.forEach(roleId => {
                        // check for AC defined for member's roles for THIS card only
                        const roleStatus = result.effective.roles[roleId];
                        if (roleStatus != null) {
                          newStatus.push(roleStatus);
                        }
                      });
                    }

                    if (newStatus.length > 0) {
                      // inherit AC from roles
                      result.effective.members[memberId] = uniq(newStatus);
                    }
                  }
                }
                if (cardDetail.card != null) {
                  const card = cardDetail.card;
                  if (card.defaultInvolvementLevel != null) {
                    // A default level is set at the card level =>
                    for (const roleId in team.roles) {
                      const rs = result.effective.roles[roleId];
                      if (rs == null) {
                        result.effective.roles[roleId] = card.defaultInvolvementLevel;
                      }
                    }

                    for (const memberId in team.members) {
                      const memberStatus = result.effective.members[memberId];
                      if (memberStatus == null) {
                        result.effective.members[memberId] = [card.defaultInvolvementLevel];
                      }
                    }
                  } else if (card.parentId != null) {
                    // if some members or roles lacks level, inherit from parent card
                    //sub-card
                    const parent = state.cards.contents[card.parentId];
                    if (parent?.content != null) {
                      nextCardId = parent.content.cardId;
                    } else {
                      // missing cardContent
                      result.status.missingCardContentId = card.parentId;
                      nextCardId = undefined;
                    }
                  } else if (card.rootCardProjectId != null) {
                    //root-card : fetch level from member position
                    nextCardId = undefined;

                    for (const memberId in team.members) {
                      const memberStatus = result.effective.members[memberId];
                      if (memberStatus == null) {
                        const member = team.members[memberId];
                        if (member != null) {
                          switch (member.position) {
                            case 'GUEST':
                              result.effective.members[memberId] = ['OUT_OF_THE_LOOP'];
                              break;
                            default:
                              result.effective.members[memberId] = ['INFORMED_READWRITE'];
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return result;
    },
    (a, b) => {
      const result =
        shallowEqual(a.status, b.status) &&
        shallowEqual(a.self.members, b.self.members) &&
        shallowEqual(a.self.roles, b.self.roles) &&
        customColabStateEquals(a.effective.members, b.effective.members) &&
        shallowEqual(a.effective.roles, b.effective.roles);
      logger.debug('ACL equals ? ', a, b, result);

      return result;
    },
  );
};

export const useAndLoadCardACL = (cardId: number | null | undefined): CardAcl => {
  const dispatch = useAppDispatch();
  const acl = useCardACL(cardId);

  React.useEffect(() => {
    logger.debug('Effect ', acl.status.missingCardId, ' | ', acl.status.missingAclCardId);
    if (acl.status.missingCardId != null) {
      logger.debug('Load Card #', acl.status.missingCardId);
      dispatch(API.getCard(acl.status.missingCardId));
    }

    if (acl.status.missingAclCardId != null) {
      logger.debug('Load ACL Card #', acl.status.missingAclCardId);
      dispatch(API.getACLsForCard(acl.status.missingAclCardId));
    }

    if (acl.status.missingCardContentId != null) {
      logger.debug('Load CardContent #', acl.status.missingCardContentId);
      dispatch(API.getCardContent(acl.status.missingCardContentId));
    }
  }, [
    acl.status.missingAclCardId,
    acl.status.missingCardId,
    acl.status.missingCardContentId,
    dispatch,
  ]);

  return acl;
};

export type MyCardAcl = {
  // status: {
  //   cardId: number | null | undefined;
  //   missingCardId: number | undefined;
  //   missingCardContentId: number | undefined;
  //   missingAclCardId: number | undefined;
  // };
  // mine: InvolvementLevel | undefined;
  canRead: boolean | undefined;
  canWrite: boolean | undefined;
};

const levelOrder: Record<InvolvementLevel, { order: number; write: boolean }> = {
  RESPONSIBLE: { order: 1, write: true },
  ACCOUNTABLE: { order: 2, write: true },
  CONSULTED_READWRITE: { order: 3, write: true },
  CONSULTED_READONLY: { order: 4, write: false },
  INFORMED_READWRITE: { order: 5, write: true },
  INFORMED_READONLY: { order: 6, write: false },
  OUT_OF_THE_LOOP: { order: 7, write: false },
};

function resolveAcl(acl: InvolvementLevel[]): InvolvementLevel {
  const sorted = acl.sort((a, b) => levelOrder[a].order - levelOrder[b].order);
  if (sorted.length === 0) {
    return 'OUT_OF_THE_LOOP';
  }
  const max = sorted[0];
  if (max === 'CONSULTED_READONLY' && acl.includes('INFORMED_READWRITE')) {
    return 'CONSULTED_READWRITE';
  }
  return max!;
}

export const useCardACLForCurrentUser = (cardId: number | null | undefined): MyCardAcl => {
  const acl = useAndLoadCardACL(cardId);
  const currentProjectId = useAppSelector(selectCurrentProjectId);
  const { currentUser } = useCurrentUser();

  const member = useMyMember(currentProjectId, currentUser?.id);

  if (currentUser?.admin) {
    return {
      canRead: true,
      canWrite: true,
    };
  }

  if (member?.id != null) {
    const levels = acl.effective.members[member.id];
    if (levels) {
      const resolved = resolveAcl(levels);
      return {
        // status: acl.status,
        // mine: resolved,
        canRead: resolved !== 'OUT_OF_THE_LOOP',
        canWrite: levelOrder[resolved].write,
      };
    }
  }

  return {
    // status: acl.status,
    // mine: undefined,
    canRead: undefined,
    canWrite: undefined,
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////

interface AclsAndStatus {
  status: AvailabilityStatus;
  acls: AccessControl[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusAclsForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.acl.statusAclsForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

// function selectAcls(state: ColabState): AccessControl[] {
//   return Object.values(state.acl.acls).flatMap(acl => Object.values(acl.acl));
// }

// function selectAclsOfCurrentProject(state: ColabState): AccessControl[] {
//   // TODO or to say it always contains only self data

//   return selectAcls(state);
// }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project
////////////////////////////////////////////////////////////////////////////////////////////////////

// function useAcls(): AclsAndStatus {
//   const currentProjectId = useAppSelector(selectCurrentProjectId);

//   const { status, data } = useFetchListWithArg<AccessControl, number | null | undefined>(
//     selectStatusAclsForCurrentProject,
//     selectAclsOfCurrentProject,
//     API.getAclsForProject,
//     currentProjectId,
//   );

//   return { status, acls: data || [] };
// }

export function useLoadAcls(): AvailabilityStatus {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  return useLoadDataWithArg(
    selectStatusAclsForCurrentProject,
    API.getAclsForProject,
    currentProjectId,
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for one card
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectCardAcls(state: ColabState, cardId: number | null | undefined): AccessControl[] {
  if (cardId) {
    return Object.values(state.acl.acls[cardId]?.acl || []);
  }

  return [];
}

export function useCardAcls(cardId: number | null | undefined): AccessControl[] {
  return useAppSelector(state => selectCardAcls(state, cardId));
}

export function useCardMemberAcl(
  cardId: number | null | undefined,
  memberId: number | null | undefined,
): AccessControl | null {
  const aclsForCard = useCardAcls(cardId);

  if (!memberId) {
    return null;
  }

  const acls = aclsForCard.filter(a => a.memberId === memberId);
  if (acls.length === 1) {
    return acls[0] || null;
  }

  return null;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current user
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectMyAcls(
  state: ColabState,
  cards: Card[],
  currentMemberId: number | null | undefined,
): AccessControl[] {
  if (currentMemberId == null) {
    return [];
  }

  const acls: AccessControl[] = [];

  cards.forEach(card => {
    const cardAcls = selectCardAcls(state, card.id);

    cardAcls.forEach(acl => {
      if (acl.memberId === currentMemberId) {
        acls.push(acl);
      }
    });
  });

  return acls;
}

export function useMyAcls(): AclsAndStatus {
  const currentMemberId = useCurrentTeamMemberId();
  const cards = useAllProjectCardsSorted().map(s => s.card); // useAllProjectCards();

  const acls = useAppSelector(state => selectMyAcls(state, cards, currentMemberId));

  // TODO status, loading

  return { status: 'READY', acls };
}
