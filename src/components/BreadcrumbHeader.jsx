import { Breadcrumb, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function BreadcrumbHeader({ title, description, actions = [], crumbs = [] }) {
  return (
    <Card className="soft-card mb-4 border-0">
      <Card.Body className="p-4 p-lg-5">
        {crumbs.length > 0 ? (
          <Breadcrumb className="mb-3">
            {crumbs.map((crumb, index) => (
              <Breadcrumb.Item
                key={`${crumb.label}-${index}`}
                linkAs={Link}
                linkProps={crumb.to ? { to: crumb.to } : undefined}
                active={!crumb.to}
              >
                {crumb.label}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        ) : null}
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
          <div>
            <h1 className="mb-2">{title}</h1>
            {description ? (
              <p className="text-secondary mb-0">{description}</p>
            ) : null}
          </div>
          {actions.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  as={action.to ? Link : "button"}
                  to={action.to}
                  variant={action.variant || "outline-dark"}
                  className="fw-semibold"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </Card.Body>
    </Card>
  );
}

export default BreadcrumbHeader;
