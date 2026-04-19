// Type stubs for the Google Identity Services (GIS) browser SDK
// loaded via <script src="https://accounts.google.com/gsi/client">

interface GoogleCredentialResponse {
  credential: string;          // signed JWT (ID token)
  select_by: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface Google {
  accounts: {
    id: {
      initialize(config: GoogleIdConfiguration): void;
      prompt(): void;
      renderButton(parent: HTMLElement, options: object): void;
      disableAutoSelect(): void;
    };
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: any) => void;
      }): { requestAccessToken(options?: { prompt?: string }): void };
    };
  };
}

declare var google: Google;
