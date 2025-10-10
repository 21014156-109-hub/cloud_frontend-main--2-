
export default function Footer() {
  const year = new Date().getFullYear();
  const version = '1.0.1';
  return (
    <footer className="footer fixed-bottom">
      <div className="row align-items-center justify-content-xl-between">
        <div className="col-xl-12">
          <div className="copyright text-center text-muted">
            &copy; {year} <a href="#" className="font-weight-bold ml-1" target="_blank" rel="noreferrer">MoboCheck</a> | Version: {version}
          </div>
        </div>
      </div>
    </footer>
  );
}
