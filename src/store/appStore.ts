import { makeAutoObservable } from 'mobx';
class AppStore {
  user = null;
  token = '';
  authCode = '';
  categories = [];
  savedWebsites = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }
  setLoading(value: boolean) {
    this.isLoading = value;
  }
  setLoginData(data: any) {
    this.user = data.user;
    this.token = data.token;
    this.authCode = data.authorizationCode;
    this.categories = data.result2?.Categories || [];
    const likedWebsites =
      (data.result2?.Categories || [])
        .flatMap(
          (category: any) =>
            category.Websites || [],
        )
        .filter(
          (website: any) =>
            website.IsLiked === true,
        );

    this.savedWebsites = likedWebsites;
  }

  addSavedWebsite(website: any) {
    const exists = this.savedWebsites.some(
      item => item.websiteid === website.websiteid,
    );

    if (!exists) {
      this.savedWebsites = [
        ...this.savedWebsites,
        {
          ...website,
          IsLiked: true,
        },
      ];
    }

    this.toggleWebsiteLike(
      website.websiteid,
      true,
    );
  }

  removeSavedWebsite(websiteId: number) {
    this.savedWebsites =
      this.savedWebsites.filter(
        item => item.websiteid !== websiteId,
      );
    this.toggleWebsiteLike(websiteId, false);
  }

  toggleWebsiteLike(
    websiteId: number,
    isLiked: boolean,
  ) {
    this.categories = this.categories.map(
      (category: any) => ({
        ...category,
        Websites: category.Websites?.map(
          (website: any) =>
            website.websiteid === websiteId
              ? {
                ...website,
                IsLiked: isLiked,
              }
              : website,
        ),
      }),
    );
  }
}



export default new AppStore();