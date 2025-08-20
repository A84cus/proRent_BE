export const ReviewQueryHelper = {
   reviewer: {
      select: {
         id: true,
         profile: { select: { firstName: true, lastName: true } }
      }
   },
   OwnerReply: { select: { id: true, content: true, createdAt: true } },
   reservation: {
      select: {
         id: true,
         startDate: true,
         endDate: true,
         Property: { select: { id: true, name: true } }
      }
   }
};

export const ReplyOwnerQueryHelper = {
   reviewer: {
      select: {
         id: true,
         profile: { select: { firstName: true, lastName: true } }
      }
   },
   OwnerReply: { select: { id: true, content: true, createdAt: true, visibility: true } },
   reservation: {
      select: {
         id: true,
         startDate: true,
         endDate: true,
         orderStatus: true,
         Property: { select: { id: true, name: true } }
      }
   }
};

export const ReviewInclude = {
   reviewer: {
      select: {
         id: true,
         profile: {
            select: {
               firstName: true,
               lastName: true,
               avatar: {
                  select: {
                     id: true,
                     url: true,
                     alt: true
                  }
               }
            }
         }
      }
   },
   reviewee: {
      select: {
         id: true,
         profile: {
            select: {
               firstName: true,
               lastName: true,
               avatar: {
                  select: {
                     id: true,
                     url: true,
                     alt: true
                  }
               }
            }
         }
      }
   },
   reservation: {
      select: {
         id: true,
         startDate: true,
         endDate: true,
         Property: { select: { id: true, name: true } }
      }
   }
};

export const ReplyInclude = {
   review: {
      include: {
         reviewer: {
            select: {
               id: true,
               profile: {
                  select: {
                     firstName: true,
                     lastName: true,
                     avatar: {
                        select: {
                           id: true,
                           url: true,
                           alt: true
                        }
                     }
                  }
               }
            }
         },
         reviewee: {
            select: {
               id: true,
               profile: {
                  select: {
                     firstName: true,
                     lastName: true,
                     avatar: {
                        select: {
                           id: true,
                           url: true,
                           alt: true
                        }
                     }
                  }
               }
            }
         },
         reservation: { select: { Property: { select: { name: true } } } }
      }
   }
};

export const SelectEligibleReservations = {
   id: true,
   startDate: true,
   endDate: true,
   Property: {
      select: {
         id: true,
         name: true,
         mainPicture: {
            select: {
               id: true,
               url: true
            }
         }
      }
   }
};
