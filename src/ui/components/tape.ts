export interface TapeLine {
  label: string;
  points: number;
}

export interface TapeHandle {
  element: HTMLElement;
  addLine(line: TapeLine): void;
  clear(): void;
}

export function createTape(headerText = 'Receipt'): TapeHandle {
  const aside = document.createElement('aside');
  aside.className = 'rm-tape';

  const header = document.createElement('h3');
  header.className = 'rm-tape-header';
  header.textContent = headerText;

  const list = document.createElement('ul');
  list.className = 'rm-tape-list';

  const footer = document.createElement('div');
  footer.className = 'rm-tape-footer';

  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Regret';

  const totalValue = document.createElement('span');
  totalValue.textContent = '0';

  footer.append(totalLabel, totalValue);
  aside.append(header, list, footer);

  let runningTotal = 0;

  const addLine = (line: TapeLine): void => {
    runningTotal += line.points;
    totalValue.textContent = String(runningTotal);

    const item = document.createElement('li');
    item.className = 'rm-tape-line';

    const label = document.createElement('span');
    label.textContent = line.label;

    const leader = document.createElement('span');
    leader.className = 'rm-tape-leader';
    leader.setAttribute('aria-hidden', 'true');

    const pts = document.createElement('span');
    pts.className = 'rm-tape-pts';
    pts.textContent = String(line.points);

    item.append(label, leader, pts);
    list.prepend(item);
  };

  const clear = (): void => {
    runningTotal = 0;
    totalValue.textContent = '0';
    list.replaceChildren();
  };

  return { element: aside, addLine, clear };
}
